import { connectWebSocket, fetchData, fetchUser } from './socket.js';
import { setupEventListeners, printUserMessage, printServerMessage, clearChatMessages } from './chatbox.js';

window.onload = async () => {
  try {
    await connectWebSocket(true);
    setupEventListeners(true);
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
  try {
    console.log('Selected client:', selectedUser);
    clearChatMessages();
    fetchUser(selectedUser);
  } catch (error) {
    throw error;
  }
}

function toggleInputAndButton(isEnabled) {
  const messageInput = document.getElementById("input");
  const sendButton = document.getElementById("send");
  const inputContainer = document.getElementById("input-container");

  messageInput.disabled = !isEnabled;
  sendButton.disabled = !isEnabled;

  if (isEnabled) {
    messageInput.classList.remove("disabled");
    sendButton.classList.remove("disabled");
    inputContainer.classList.remove("disabled");
  } else {
    messageInput.classList.add("disabled");
    sendButton.classList.add("disabled");
    inputContainer.classList.add("disabled");
  }
}
