import { connectWebSocket, fetchData, sendMessageServer } from './socket.js';
import { createInitalChart } from './viz.js';
import { setupEventListeners } from './chatbox.js';

window.onload = async () => {
  try {
    await connectWebSocket(false);
    await createInitalChart(["data", "args"]);
    setupEventListeners();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
};
