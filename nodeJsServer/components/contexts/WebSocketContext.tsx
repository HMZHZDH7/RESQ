"use client";

import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { getErrorMessage } from "@/lib/get-error-message";

interface IMessage {
    content: string;
    type: "server" | "client" | "error";
};

interface IChart {
    data: any;
    args: any;
    image?: string;
};

interface ICommand {
    type: "server" | "client" | "error";
    content: string;
};

type WebSocketContextType = {
    messages: IMessage[];
    sendMessage: (message: string) => void;
    charts: IChart[];
    currentChart: IChart | null;
    setChartFromHistory: (chartIndex: IChart) => void;
    setImageForChart: (chart: IChart, image: string) => void;
    conversationIdsList: string[];
    currentConversationId: string;
    setCurrentConversation: (conversationId: string) => void;
    commands: ICommand[];
    sendCommand: (command: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
    messages: [],
    sendMessage: () => { },
    charts: [],
    currentChart: null,
    setChartFromHistory: () => { },
    setImageForChart: () => { },
    conversationIdsList: [],
    currentConversationId: "",
    setCurrentConversation: () => { },
    commands: [],
    sendCommand: () => { }
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const socket = useRef<WebSocket | null>(null);
    const socketState = useRef<"waiting" | "connected">("waiting");
    const isAdmin = useRef<boolean>(false);
    const [chatMessages, setChatMessages] = useState<IMessage[]>([]);
    const [charts, setCharts] = useState<IChart[]>([]);
    const [currentChart, setCurrentChart] = useState<IChart | null>(null);
    const [conversationIdsList, setConversationIdsList] = useState<string[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string>("");
    const lastChartDatasRef = useRef<{ data: null | any, args: null | any }>({ data: null, args: null });
    const maxCharts = 5;
    const [commands, setCommands] = useState<ICommand[]>([]);

    async function handleIncommingMessage(message: any) {
        //Handle potential errors
        if (message.error) {
            message.message.forEach((errorMsg: any) => {
                printMessage({ str: errorMsg.str, srv: true }, true);
            });
        }
        else {
            //Handle incomming message
            console.log("Handling message");
            console.log(message);
            if (message.message) {
                if (message.message.str === "Hello from server" && socketState.current === "waiting" && "isAdmin" in message) {
                    socketState.current = "connected";
                    isAdmin.current = message.isAdmin === true;
                    printMessage(message.message);
                    return getInitialsData();
                };

                //Make single entries into array to be processed by forEach
                const messages = Array.isArray(message.message) ? message.message : [message.message];

                //Make printFunction functor
                //If admin print user message into server and opposite for user
                //set pintFunction either printServerMessage or printUserMessage
                messages.forEach((entrie: any) => {
                    printMessage(entrie);
                });
            }
            //Handle incomming data
            if (message.data) {
                const json = message.data;
                //Received compressed jsons
                if (typeof json.data === 'string' && typeof json.args === 'string') {
                    printMessage({ str: 'Received both data and args, Creating a new chart....', srv: true });
                    const dataJson = await retrieveFileContent(json.data);
                    const argsJson = await retrieveFileContent(json.args);
                    createNewLineChart(dataJson, argsJson);
                }
                else if (typeof json.data === 'string') {
                    printMessage({ str: 'Received only data, Creating a new chart....', srv: true });
                    const dataJson = await retrieveFileContent(json.data);
                    createNewLineChart(dataJson, undefined);
                }
                else if (typeof json.args === 'string') {
                    printMessage({ str: 'Received only args, Creating a new chart....', srv: true });
                    const argsJson = await retrieveFileContent(json.args);
                    createNewLineChart(undefined, argsJson);
                }
                //Received clean jsons
                else if (json.data !== null && json.args !== null) {
                    printMessage({ str: 'Received both data and args, Creating a new chart....', srv: true });
                    createNewLineChart(json.data, json.args);
                }
                else { console.error("Received empty data field"); }
            }
            //If the admin receive the list of users
            if (message.clients) {
                updateClientList(message.clients);
            }
            //answer of a bash request
            if (message.promptMsg) {
                printCommand({ content: message.promptMsg.str, type: message.promptMsg.error ? "error" : "server" });
            }
        }
    };

    async function getInitialsData() {
        if (!isAdmin.current) fetchData(["data", "args"]);
    };

    // Function to create the line chart
    async function createNewLineChart(data = null, args = null) {
        if (data && args) {
            lastChartDatasRef.current.data = data;
            lastChartDatasRef.current.args = args;
            console.log("Creating new chart from new data & args");
            console.log("data :");
            console.log(lastChartDatasRef.current.data);
            console.log("args :");
            console.log(lastChartDatasRef.current.args);
        }
        else if (data) {
            lastChartDatasRef.current.data = data;
            console.log("Creating new chart from new data");
            console.log("data :");
            console.log(lastChartDatasRef.current.data);
        }
        else if (args) {
            lastChartDatasRef.current.args = args;
            console.log("Creating new chart from new args");
            console.log("args :");
            console.log(lastChartDatasRef.current.args);
        }

        if (lastChartDatasRef.current.data && lastChartDatasRef.current.args) {
            const newChart: IChart = { data: lastChartDatasRef.current.data, args: lastChartDatasRef.current.args }
            setCharts(prevCharts => {
                const updatedCharts = [newChart, ...prevCharts];
                while (updatedCharts.length > maxCharts) updatedCharts.pop();
                return updatedCharts;
            });
            setCurrentChart(newChart);
        } else {
            console.error('Data or args are not defined. Cannot create chart.');
        }
    }

    // Fetch one or multiple jsons
    function fetchData(json_name: any) {
        try {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({ action: 'fetchData', json_name }));
            } else {
                console.log(socket.current, socket.current?.readyState)
                throw new Error('WebSocket is not connected');
            }
        } catch (error) { throw error; }
    }

    // Directory of the server and json name
    function fetchUser(json_name: any) {
        try {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({ action: 'fetchUser', json_name }));
            } else {
                throw new Error('WebSocket is not connected');
            }
        } catch (error) { throw error; }
    }

    // Function to send a message to the server
    function sendMessageServer(message: any) {
        try {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({ action: 'sendMessageToRasa', message }));
            } else {
                throw new Error('WebSocket is not connected');
            }
        } catch (error) { throw error; }
    }

    // Function to send a message to the selected user via the server
    function sendMessageToUser(message: any) {
        try {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({ action: 'sendMessageToUser', message }));
            } else {
                throw new Error('WebSocket is not connected');
            }
        } catch (error) {
            console.error('Error sending message to user:', getErrorMessage(error));
            throw error;
        }
    }

    //Decompress the filecontent encapsulated by the server
    async function retrieveFileContent(fileContent: string) {
        const base64ToUint8Array = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const compressedData = base64ToUint8Array(fileContent);

        const decompressedStream = new DecompressionStream('gzip');
        const decompressedWriter = decompressedStream.writable.getWriter();
        decompressedWriter.write(compressedData);
        decompressedWriter.close();

        const stream = decompressedStream.readable.pipeThrough(new TextDecoderStream());

        let jsonString = '';
        const reader = stream.getReader();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            jsonString += value;
        }
        return JSON.parse(jsonString);
    }

    function sendAdminActionRequests(command: any) {
        try {
            if (socket.current && socket.current.readyState === WebSocket.OPEN) {
                socket.current.send(JSON.stringify({
                    action: 'admin',
                    command: command
                }));
            } else {
                throw new Error('WebSocket is not connected');
            }
        } catch (error) {
            console.error('Error sending admin action requests:', getErrorMessage(error));
            throw error;
        }
    }

    function printMessage({ str, srv }: { str: string, srv: boolean }, isErrorMessage: boolean = false) {
        console.log("Message:", { str, srv });
        if (isErrorMessage) setChatMessages((prevMessages) => [...prevMessages, { content: str, type: "error" }]);
        else setChatMessages((prevMessages) => [...prevMessages, { content: str, type: srv != isAdmin.current ? "server" : "client" }]);
    };

    function printCommand(command: { content: string, type: "client" | "server" | "error" }) {
        setCommands((prevCommands) => [...prevCommands, command]);
    };

    function updateClientList({ connectedList, userLoggedList }: { connectedList: string[], userLoggedList: string[] }) {
        setCurrentConversation("");
        setConversationIdsList(userLoggedList);
    };

    useEffect(() => {
        const ws = new WebSocket(`/ws`);
        socket.current = ws;

        ws.onopen = () => {
            console.log("Connected to the WebSocket server!");
        };

        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            handleIncommingMessage(data);
        };

        ws.onclose = () => console.log('Disconnected from the WebSocket server');

        ws.onerror = (error) => console.log('WebSocket error', error);

        return () => ws.close();
    }, []);

    const sendMessage = (message: string) => {

        if (isAdmin.current) {
            //Send the string into the selected client
            try {
                printMessage({ str: message, srv: true });
                sendMessageToUser(message);
            } catch (error) {
                console.error(error);
            }
        }
        else {
            //Send the string into the nodejs server
            try {
                printMessage({ str: message, srv: false });
                sendMessageServer(message);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const setChartFromHistory = (chart: IChart) => {
        console.log(chart, currentChart);
        if (chart !== currentChart) setCurrentChart(chart);
    };

    const setImageForChart = (chart: IChart, image: string) => {
        setCharts(prevCharts => {
            const updatedCharts = prevCharts.map(c => {
                if (c === chart) {
                    c.image = image;
                }
                return c;
            });
            return updatedCharts;
        });
    };

    const setCurrentConversation = (conversationId: string) => {
        if (conversationId === "") return;
        try {
            console.log('Selected client:', conversationId);
            setCurrentConversationId(conversationId);
            setChatMessages([]);
            setCurrentChart(null);
            setCharts([]);
            fetchUser(conversationId);
        } catch (error) {
            throw error;
        };
    };

    const sendCommand = (command: string) => {
        printCommand({ content: command, type: "client" });
        sendAdminActionRequests(command);
    };

    return (
        <WebSocketContext.Provider value={{ messages: chatMessages, sendMessage, charts, currentChart, setChartFromHistory, setImageForChart, conversationIdsList, currentConversationId, setCurrentConversation, commands, sendCommand }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketContext;