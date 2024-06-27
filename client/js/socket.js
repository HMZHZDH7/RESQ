import { createLineChart, createInitalChart } from './viz.js';
import { setupEventListeners, getMessage } from './chatbox.js';

let ws;
let pendingRequests = {};

export function connectWebSocket() {
    return new Promise((resolve, reject) => {
        ws = new WebSocket('ws://localhost:3000');
        ws.onopen = () => {
            console.log('Connected to the WebSocket server');
            resolve();
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.requestId && pendingRequests[data.requestId]) {
                pendingRequests[data.requestId](data);
                delete pendingRequests[data.requestId];
            } else {
                let msg = data.message
                console.log('Received:', msg);
                getMessage(msg);
            }
        };
        ws.onclose = () => {
            console.log('Disconnected from the WebSocket server');
        };
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
        };
    });
}

export function fetchData(json_name) {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const requestId = Date.now().toString();
            pendingRequests[requestId] = (data) => {
                if (data.error) {
                    getMessage(`Error: ${data.message} for ${data.json_name}`);
                    reject(new Error(data.message));
                } else {
                    getMessage(`Received ${data.json_name}.json`);
                    resolve(data.data);
                }
            };
            ws.send(JSON.stringify({ action: 'fetchData', json_name, requestId }));
        } else {
            reject(new Error('WebSocket is not connected'));
        }
    });
}

export async function sendMessageServer(message) {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const requestId = Date.now().toString();
            pendingRequests[requestId] = async (data) => {
                try {
                    if (data.error) {
                        getMessage(`Error: ${data.message}`);
                        reject(new Error(data.message));
                    } else {
                        if (data.message) {
                            const messages = data.message;
                            Object.values(messages).forEach(msg => {
                                getMessage(msg);
                            });
                        }

                        if (Object.keys(data.data).length > 0) {
                            getMessage(`Received ${data.json_name}.json, Decoding ...`);
                            let decompressedData = [];

                            // Process each key in data.data
                            for (const key in data.data) {
                                if (data.data.hasOwnProperty(key)) {
                                    decompressedData.push(await retrieveFileContent(data.data[key].file_content));
                                }
                            }
                            resolve(decompressedData);
                        } else {
                            resolve([]);
                        }
                    }
                } catch (error) {
                    reject(error);
                }
            };
            ws.send(JSON.stringify({ action: 'sendMessageToRasa', message, requestId }));
        } else {
            reject(new Error('WebSocket is not connected'));
        }
    });
}

async function retrieveFileContent(fileContent) {
    const base64ToUint8Array = (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));
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

// Initialize WebSocket and call createLineChart after the connection is established
window.onload = async () => {
    try {
        await connectWebSocket();
        // Example usage: log = false, json_names = ["data", "args"]
        await createInitalChart(false, ["data", "args"]);
        setupEventListeners();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};
