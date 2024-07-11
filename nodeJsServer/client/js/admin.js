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
  const { connectedList, userLoggedList } = clients;
  console.log('Updating client list:', clients);
  const clientSelector = document.getElementById('client-selector');
  clientSelector.innerHTML = '';  // Clear existing options

  // Add a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a client';
  clientSelector.appendChild(defaultOption);

  // Add logged clients options
  userLoggedList.forEach(userId => {
    const option = document.createElement('option');
    option.value = userId;
    option.textContent = userId;

    if (connectedList.includes(userId)) {
      option.classList.add('green'); // Connected client in green
    } else {
      option.classList.add('red'); // Logged but not connected client in red
    }

    clientSelector.appendChild(option);
  });

  // Set the selector to the default option
  clientSelector.value = '';

  // Add event listener for selection change
    clientSelector.addEventListener('change', (event) => {
      const selectedValue = event.target.value;
      const selectedOption = event.target.options[event.target.selectedIndex];

      // Manage state if connected or not
      clientSelector.classList.remove('green', 'red');
      if (selectedOption.classList.contains('green')) {
        clientSelector.classList.add('green');
        toggleInputAndButton(true);
      } else if (selectedOption.classList.contains('red')) {
        clientSelector.classList.add('red');
        toggleInputAndButton(false);
      } else {
        toggleInputAndButton(false);
      }

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

function toggleInputAndButton(isEnabled) {
  const messageInput = document.getElementById("input");
  const sendButton = document.getElementById("send");

  messageInput.disabled = !isEnabled;
  sendButton.disabled = !isEnabled;

  if (isEnabled) {
    messageInput.classList.remove("disabled");
    sendButton.classList.remove("disabled");
  } else {
    messageInput.classList.add("disabled");
    sendButton.classList.add("disabled");
  }
}
