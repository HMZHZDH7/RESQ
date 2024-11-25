"use client";

import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { getErrorMessage } from "@/lib/get-error-message";

interface Message {
    content: string;
    type: "server" | "client";
}

interface Chart {
    data: any;
    args: any;
    image?: string;
}

type WebSocketContextType = {
    messages: Message[];
    sendMessage: (message: string) => void;
    charts: Chart[];
    currentChart: Chart | null;
    setChartFromHistory: (chartIndex: Chart) => void;
    setImageForChart: (chart: Chart, image: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType>({
    messages: [],
    sendMessage: () => { },
    charts: [],
    currentChart: null,
    setChartFromHistory: () => { },
    setImageForChart: () => { }
});

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
    const socket = useRef<WebSocket | null>(null);
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [charts, setCharts] = useState<Chart[]>([]);
    const [currentChart, setCurrentChart] = useState<Chart | null>(null);
    const lastChartDatasRef = useRef<{ data: null | any, args: null | any }>({ data: null, args: null });
    const maxCharts = 5;

    async function handleIncommingMessage(message: any, admin: any) {
        //Handle potential errors
        if (message.error) {
            message.message.forEach((errorMsg: any) => {
                printServerMessage(errorMsg.str);
            });
        }
        else {
            //Handle incomming message
            console.log("Handling message");
            console.log(message);
            if (message.message) {
                //Make single entries into array to be processed by forEach
                const messages = Array.isArray(message.message) ? message.message : [message.message];

                //Make printFunction functor
                //If admin print user message into server and opposite for user
                //set pintFunction either printServerMessage or printUserMessage
                messages.forEach((entrie: any) => {
                    const printFunction = admin
                        ? (entrie.srv ? printUserMessage : printServerMessage)
                        : (entrie.srv ? printServerMessage : printUserMessage);

                    printFunction(entrie.str);
                });
            }
            //Handle incomming data
            if (message.data) {
                const json = message.data;
                //Received compressed jsons
                if (typeof json.data === 'string' && typeof json.args === 'string') {
                    printServerMessage('Received both data and args, Creating a new chart....');
                    const dataJson = await retrieveFileContent(json.data);
                    const argsJson = await retrieveFileContent(json.args);
                    createNewLineChart(dataJson, argsJson);
                }
                else if (typeof json.data === 'string') {
                    printServerMessage('Received only data, Creating a new chart....');
                    const dataJson = await retrieveFileContent(json.data);
                    createNewLineChart(dataJson, undefined);
                }
                else if (typeof json.args === 'string') {
                    printServerMessage('Received only args, Creating a new chart....');
                    const argsJson = await retrieveFileContent(json.args);
                    createNewLineChart(undefined, argsJson);
                }
                //Received clean jsons
                else if (json.data !== null && json.args !== null) {
                    printServerMessage('Received both data and args, Creating a new chart....');
                    createNewLineChart(json.data, json.args);
                }
                else { console.error("Received empty data field"); }
            }
            //If the admin receive the list of users
            if (message.clients) {
                //updateClientList(message.clients);
            }
            //answer of a bash request
            if (message.promptMsg) {
                //printServerCommand(message.promptMsg.str, message.promptMsg.error);
            }
        }
    }

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
            const newChart: Chart = { data: lastChartDatasRef.current.data, args: lastChartDatasRef.current.args }
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

    //Set user message in the front and set it to the server
    function printUserMessage(message: string) {
        setChatMessages((prevMessages) => [...prevMessages, { content: message, type: "client" }]);
    }

    //Set Bot message inside the chatbox
    function printServerMessage(message: string) {
        setChatMessages((prevMessages) => [...prevMessages, { content: message, type: "server" }]);
    }

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:3000/ws`);
        socket.current = ws;

        ws.onopen = () => {
            console.log("Connected to the WebSocket server!");
            fetchData(["data", "args"]);
        };

        ws.onmessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data);
            handleIncommingMessage(data, false);
        };

        ws.onclose = () => console.log('Disconnected from the WebSocket server');

        ws.onerror = (error) => console.log('WebSocket error', error);

        return () => ws.close();
    }, []);

    const sendMessage = (message: string, isAdmin: boolean = false) => {

        if (isAdmin) {
            //Send the string into the selected client
            try {
                printUserMessage(message);
                sendMessageToUser(message);
            } catch (error) {
                console.error(error);
            }
        }
        else {
            //Send the string into the nodejs server
            try {
                printUserMessage(message);
                sendMessageServer(message);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const setChartFromHistory = (chart: Chart) => {
        console.log(chart, currentChart);
        if (chart !== currentChart) setCurrentChart(chart);
    };

    const setImageForChart = (chart: Chart, image: string) => {
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

    return (
        <WebSocketContext.Provider value={{ messages: chatMessages, sendMessage, charts, currentChart, setChartFromHistory, setImageForChart }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default WebSocketContext;