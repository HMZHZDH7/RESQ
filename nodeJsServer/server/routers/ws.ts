import WebSocket from "ws";
import { Server } from "http";
import url from "url";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import * as rasaClient from "../../lib/rasaClient";
import { getErrorMessage } from "../../lib/get-error-message";

interface WebSocketUser extends WebSocket {
    user_id?: string;
    logFileHandle?: string;
    selectedUser?: string;
}

let clients: WebSocketUser[] = [];
let admins: WebSocketUser[] = [];
const actionsList =
    `action_change_plottype - Slot: plot_type
action_change_selectedvalue - Slot: selected_value, nat_value
action_toggle_national_value - Slot: nat_value
action_prefill_slots - Slot: plot_type, nat_value, selected_value, real_diff
action_initialise - Slot: plot_type, nat_value, selected_value
action_variable_ttest - Slot: real_diff
action_explore_effects - Slot: selected_value
action_default_fallback - Slot: fallback_triggered`;

export default (server: Server) => {
    const wss = new WebSocket.Server({
        noServer: true,
        path: "/ws",
    });

    server.on("upgrade", (request, socket, head) => {
        if (request.url === "/ws") {
            wss.handleUpgrade(request, socket, head, (websocket) => {
                wss.emit("connection", websocket, request);
            });
        }
    });


    // Handle WebSocket connections
    wss.on('connection', (ws: WebSocketUser, request) => {
        // Parse the URL to get the query parameters (Admin === 'true')
        const query = url.parse(request.url as string, true).query;

        //Admin logic
        if (query.admin === 'true') {
            admins.push(ws);
            console.log(`New admin connected`);

            // Send the current list of clients and users with logs to the new admin
            const userLoggedList = rasaClient.getUserLoggedList();
            const clientList = clients.map(client => client.user_id);
            ws.send(JSON.stringify({
                clients: {
                    connectedList: clientList,
                    userLoggedList: userLoggedList
                }
            }));
        }
        //User logic
        else {
            ws.user_id = uuidv4().split('-')[0];  // Generate a unique user_id and take the first part

            ws.logFileHandle = rasaClient.setupLogging(ws.user_id); // Create the logging file
            clients.push(ws);
            console.log(`New client connected with user_id: ${ws.user_id}`);

            // Send updated client list to all admins
            const userLoggedList = rasaClient.getUserLoggedList();
            const clientListMessage = JSON.stringify({
                clients: {
                    connectedList: clients.map(client => client.user_id),
                    userLoggedList: userLoggedList
                }
            });
            admins.forEach(admin => {
                if (admin.readyState === WebSocket.OPEN) { admin.send(clientListMessage); }
            });
        }

        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message.toString());

            //The case for the client fetching server-based json
            if (parsedMessage.action === 'fetchData') {
                try {
                    console.log(`Client asking for ${Array.isArray(parsedMessage.json_name) ? parsedMessage.json_name.join(', ') : parsedMessage.json_name}.json`);

                    let data: Record<string, any> = {};
                    if (Array.isArray(parsedMessage.json_name)) {
                        parsedMessage.json_name.forEach((name: string) => {
                            const jsonData = fs.readFileSync(path.join(process.cwd(), 'server', 'data', `${name}.json`));
                            data[name] = JSON.parse(jsonData.toString());
                        });
                    } else {
                        const jsonData = fs.readFileSync(path.join(process.cwd(), 'server', 'data', `${parsedMessage.json_name}.json`));
                        data[parsedMessage.json_name] = JSON.parse(jsonData.toString());
                    }

                    ws.send(JSON.stringify({
                        error: false,
                        data: data
                    }));
                } catch (error) {
                    console.error('Error reading JSON file:', error);
                    ws.send(JSON.stringify({
                        error: true,
                        message: [{ str: `Failed to read JSON file : ${Array.isArray(parsedMessage.json_name) ? parsedMessage.json_name.join(', ') : parsedMessage.json_name}`, srv: true }]
                    }));
                }
            }

            //The case for fetching user logs
            else if (parsedMessage.action === 'fetchUser') {
                ws.selectedUser = parsedMessage.json_name; //user selected by the admin
                console.log(`Admin asking for ${parsedMessage.json_name} logs`);
                const jsonData = fs.readFileSync(path.join(process.cwd(), 'logs', `${parsedMessage.json_name}.json`));

                const parsedMessageToSend = rasaClient.parseLogsToSend(JSON.parse(jsonData.toString()));
                ws.send(JSON.stringify(parsedMessageToSend));
            }

            //The case for calling a Rasa Request
            else if (parsedMessage.action === 'sendMessageToRasa') {
                let rasaTimestamp = null;
                let userTimestamp = new Date().toISOString();
                console.log(`${ws.user_id} asking: ${parsedMessage.message}`);


                //Sending request to Rasa
                rasaClient.sendMessageToRasa(parsedMessage.message, ws.user_id as string)
                    .then(response => {
                        //Cli log
                        rasaTimestamp = new Date().toISOString();
                        console.log("Response from Rasa Server:");
                        console.log(response);

                        //Sending client
                        ws.send(JSON.stringify({
                            error: false,
                            message: response.message,
                            data: {
                                data: response.data?.data?.file_content,
                                args: response.data?.args?.file_content
                            }
                        }));

                        //Sending it into the admin watching the clients
                        const watchingAdmin = admins.find(admin => admin.selectedUser === ws.user_id);
                        if (watchingAdmin) {
                            // Create a new array with parsedMessage at the start
                            const combinedMessages = [{ str: parsedMessage.message, srv: false }, ...response.message];

                            watchingAdmin.send(JSON.stringify({
                                error: false,
                                message: combinedMessages,
                                data: {
                                    data: response.data?.data?.file_content,
                                    args: response.data?.args?.file_content
                                }
                            }))
                        }

                        //Logging on the file handle: User msg and Rasa Response
                        rasaClient.logInteraction(ws.logFileHandle as string, userTimestamp, parsedMessage.message, rasaTimestamp, response);
                    })
                    .catch(error => {
                        console.error('Error sending message to Rasa:', error);
                        ws.send(JSON.stringify({
                            error: true,
                            message: [{ str: 'Failed to process message with Rasa', srv: true }]
                        }));
                    });
            }
            else if (parsedMessage.action === 'sendMessageToUser') {
                try {
                    // Find the selected user into the list of active socket
                    if (ws.selectedUser) {
                        const selectedClient = clients.find(client => client.user_id === ws.selectedUser);
                        if (selectedClient) {
                            selectedClient.send(JSON.stringify({
                                error: false,
                                message: [{ str: parsedMessage.message, srv: true }]
                            }));
                            rasaClient.logSingleEntry(selectedClient.logFileHandle as string, parsedMessage.message, true);
                        } else {
                            throw new Error("Couldn't find selected user");
                        }
                    } else {
                        throw new Error("Couldn't send message to user without any selected");
                    }
                } catch (error) {
                    console.error('Error processing sendMessageToUser:', getErrorMessage(error));
                    ws.send(JSON.stringify({
                        error: true,
                        message: [{ str: getErrorMessage(error), srv: true }]
                    }));
                }
            }
            if (parsedMessage.action === 'admin') {
                console.log(`Received command from admin: ${parsedMessage.command}`);

                if (parsedMessage.command === "help") {
                    ws.send(JSON.stringify({
                        promptMsg: {
                            str: "action --slot1 val1 --slot2 val2",
                            error: false,
                        }
                    }));
                } else if (parsedMessage.command === "list") {
                    ws.send(JSON.stringify({
                        promptMsg: {
                            str: actionsList,
                            error: false,
                        }
                    }));
                } else {
                    try {
                        // Parse the command into a single action with slots
                        const parsedCommand = rasaClient.parseCommand(parsedMessage.command);
                        // Extract the action and slots
                        const { action, slots } = parsedCommand;

                        // Trigger the SDK action with the parsed slots
                        rasaClient.triggerAction(action, slots)
                            .then(response => {
                                console.log(`Action ${action} executed successfully:`, response);

                                // Send confirmation message to the admin
                                ws.send(JSON.stringify({
                                    promptMsg: {
                                        str: `Action ${action} executed successfully.`,
                                        error: false,
                                    },
                                    message: response.message, // Include Rasa response message
                                    data: {
                                        data: response.data?.data?.file_content,
                                        args: response.data?.args?.file_content
                                    }
                                }));

                                // Send the message to the selected user if available
                                if (ws.selectedUser) {
                                    const selectedClient = clients.find(client => client.user_id === ws.selectedUser);
                                    if (selectedClient) {
                                        selectedClient.send(JSON.stringify({
                                            error: false,
                                            message: [{ str: response.message, srv: true }]
                                        }));

                                        // Log the response for the selected user
                                        rasaClient.logSingleEntry(selectedClient.logFileHandle as string, response.message, true);
                                    } else {
                                        throw new Error("Couldn't find selected user");
                                    }
                                } else {
                                    throw new Error("No selected user to send the message to");
                                }
                            })
                            .catch(error => {
                                console.error(`Error executing action ${action}:`, error);
                                ws.send(JSON.stringify({
                                    promptMsg: {
                                        str: `Error executing action ${action}: ${error.message}`,
                                        error: true,
                                    }
                                }));
                            });
                    } catch (error) {
                        console.error(`Error parsing command:`, error);
                        ws.send(JSON.stringify({
                            promptMsg: {
                                str: `Can't parse your command: ${getErrorMessage(error)}`,
                                error: true,
                            }
                        }));
                    }
                }
            }
        }); //onmessage

        //Welcome Message
        ws.send(JSON.stringify({ message: { str: 'Hello from server', srv: true } }));

        ws.on('close', () => {
            if (query.admin === 'true') {
                console.log('Admin disconnected');
                admins = admins.filter(admin => admin !== ws);
            } else {
                console.log(`Client disconnected ${ws.user_id}`);
                clients = clients.filter(client => client !== ws);

                // Send updated client list to all admins
                const userLoggedList = rasaClient.getUserLoggedList();
                const clientListMessage = JSON.stringify({
                    clients: {
                        connectedList: clients.map(client => client.user_id),
                        userLoggedList: userLoggedList
                    }
                });
                admins.forEach(admin => {
                    if (admin.readyState === WebSocket.OPEN) {
                        admin.send(clientListMessage);
                    }
                });
            }
        });

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    });
};