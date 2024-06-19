import { createLineChart } from './viz.js';
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
          console.log(event);
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
                getMessage(`Received ${data.json_name}.json`);
                resolve(data.data);
            };
            ws.send(JSON.stringify({ action: 'fetchData', json_name, requestId }));
        } else {
            reject(new Error('WebSocket is not connected'));
        }
    });
}

export function sendMessageServer(message) {
    return new Promise((resolve, reject) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const requestId = Date.now().toString();
            pendingRequests[requestId] = (data) => {
                getMessage(data.message);
            };
            ws.send(JSON.stringify({ message, requestId }));
        } else {
            reject(new Error('WebSocket is not connected'));
        }
    });
}

// Initialize WebSocket and call createLineChart after the connection is established
window.onload = async () => {
    try {
        await connectWebSocket();
        // Example usage: log = false, json_names = ["data", "args"]
        await createLineChart(false, ["data", "args"]);
        setupEventListeners();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};
