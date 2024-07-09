import { printUserMessage, printServerMessage } from './chatbox.js';
import { updateClientList } from './admin.js';

let ws;
let pendingRequests = {};

export function connectWebSocket(isAdmin) {
  return new Promise((resolve, reject) => {
    ws = new WebSocket(`ws://localhost:3000?admin=${isAdmin}`);

    ws.onopen = () => {
      console.log(`Connected to the WebSocket server as ${isAdmin ? 'admin' : 'user'}`);
      resolve();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //This cas is not a pending request cause it is first sent by the server so we need to manage it here
      if (isAdmin && data.type === 'clientList') {
        updateClientList(data.clients);
      } else if (data.requestId && pendingRequests[data.requestId]) {
        pendingRequests[data.requestId](data);
        delete pendingRequests[data.requestId];
      } else {
        let msg = data.message;
        console.log('Received:', msg);
        printServerMessage(msg);
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

//Directory of the server and json name
export function fetchData(dir, json_name) {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const requestId = Date.now().toString();
      pendingRequests[requestId] = (data) => {
        if (data.error) {
          printServerMessage(`Error: ${data.message} for ${data.json_name}`);
          reject(new Error(data.message));
        } else {
          resolve(data.data);
        }
      };
      ws.send(JSON.stringify({ action: 'fetchData', dir, json_name, requestId }));
    } else {
      reject(new Error('WebSocket is not connected'));
    }
  });
}

export async function sendMessageServer(message) {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const requestId = Date.now().toString();
      pendingRequests[requestId] = async (payload) => {
        try {
          if (payload.error) {
            printServerMessage(`Error: ${payload.message}`);
            reject(new Error(payload.message));
          } else {
            // Handle messages
            if (payload.message) {
              const messages = payload.message;
              Object.values(messages).forEach(msg => {
                printServerMessage(msg);
              });
            }
            if (payload.data) {
              // Handle data and args
              let decompressedData = {};
              let jsons = payload.data;

              if (jsons.data) {
                printServerMessage(`Received data, Decoding ...`);
                decompressedData['data'] = await retrieveFileContent(jsons.data.file_content);
              }
              if (jsons.args) {
                printServerMessage(`Received args, Decoding ...`);
                decompressedData['args'] = await retrieveFileContent(jsons.args.file_content);
              }

              resolve(decompressedData);
            }
            else resolve([]);
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
