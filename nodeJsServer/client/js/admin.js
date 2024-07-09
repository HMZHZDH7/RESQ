import { connectWebSocket, fetchData } from './socket.js';
import { createInitalChart } from './viz.js';
import { setupEventListeners, printUserMessage, printServerMessage, clearChatMessages } from './chatbox.js';

window.onload = async () => {
  try {
    await connectWebSocket(true);
    setupEventListeners();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
};

export function updateClientList(clients) {
  console.log('Updating client list:', clients);
  const clientSelector = document.getElementById('client-selector');
  clientSelector.innerHTML = '';  // Clear existing options

  // Add a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a client';
  clientSelector.appendChild(defaultOption);

  // Add client options
  clients.forEach(userId => {
    const option = document.createElement('option');
    option.value = userId;
    option.textContent = userId;
    clientSelector.appendChild(option);
  });

  // Set the selector to the default option
  clientSelector.value = '';

  // Add event listener for selection change
  clientSelector.addEventListener('change', (event) => {
    const selectedValue = event.target.value;
    if (selectedValue) {
      handleClientSelection(selectedValue);
    }
  });
}

// Example function to handle client selection
async function handleClientSelection(selectedUser) {
  console.log('Selected client:', selectedUser);
  clearChatMessages();

  try {
    const jsonData = await fetchData("logs", selectedUser);

    jsonData.forEach((data) => {
      const userMessage = data.user.message;
      const rasaMessages = data.rasa.response.message;
      const rasaData = data.rasa.response.data;

      printUserMessage(userMessage);

      rasaMessages.forEach((message) => {
        printServerMessage(message);
      });

      if (rasaData) {
        if (rasaData.data) {
          printServerMessage('data.json received');
        }
        if (rasaData.args) {
          printServerMessage('args.json received');
        }
      }
    });
  } catch (error) {
    console.error("Error fetching or processing messages:", error);
  }
}
