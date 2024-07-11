import { sendMessageServer, fetchData } from './socket.js';
import { createLineChart } from './viz.js';

// WebSocket
let xy = {};
let yAxis = 'Age';
let xAxis = 'Gender';
let plotType = 'line';
let trendLineChecked = false;
let errorBarChecked = false;
let nationalValuesChecked = false;
let selectedHospitals = [];

const generateXAndYAxisDropdowns = () => {
  const xDropdown = document.getElementById("x-axis-select");
  const yDropdown = document.getElementById("y-axis-select");
  Object.keys(xy).forEach((key) => {
    const xoption = document.createElement("option");
    xoption.value = key;
    xoption.text = key;
    const yoption = document.createElement("option");
    yoption.value = key;
    yoption.text = key;
    xDropdown.appendChild(xoption);
    yDropdown.appendChild(yoption);
  });
};

export async function setupEventListeners() {
  const messageInput = document.getElementById("input");
  messageInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });
  const sendButton = document.getElementById("send");
  sendButton.onclick = sendMessage;
  const menuButton = document.getElementById("pop-up-button");
  menuButton.onclick = openMenu;
  const thumbnails = document.getElementsByClassName("gallery-image");
  for (let i = 0; thumbnails.length; i++) {
    thumbnails[i].addEventListener("click", () => {
      showImage(thumbnails[i]);
    });
  }

  const yAxisSelect = document.getElementById("y-axis-select");
  yAxisSelect.addEventListener("change", (event) => {
    yAxis = event.target.value;
  });
  const xAxisSelect = document.getElementById("x-axis-select");
  xAxisSelect.addEventListener("change", (event) => {
    xAxis = event.target.value;
  });
  /*const plotTypeSelect = document.getElementById("plot-type-select");
  plotTypeSelect.addEventListener("change", (event) => {
  plotType = event.target.value;
});*/
const trendLine = document.getElementById("trend-line");
trendLine.addEventListener("change", (event) => {
  trendLineChecked = trendLine.checked;
});
const errorBar = document.getElementById("error-bar");
errorBar.addEventListener("change", (event) => {
  errorBarChecked = errorBar.checked;
});
const nationalValues = document.getElementById("national-values");
nationalValues.addEventListener("change", (event) => {
  nationalValuesChecked = nationalValues.checked;
});

const hospitalComparison = document.getElementById("hospital-select");
hospitalComparison.addEventListener("change", (event) => {
  selectedHospitals = Array.from(hospitalComparison.options)
  .filter(option => option.selected)
  .map(option => option.value);
  if (selectedHospitals.includes('None')) {
    console.log("None selected");
    selectedHospitals = ['None'];
  } else {
    console.log(selectedHospitals);
  }
});
}

export function showImage(thumbnail) {
  console.log(thumbnail);
  const overlay = document.getElementById("overlay");
  overlay.src = thumbnail.src;
  overlay.classList.remove("hidden");

  const chart = document.getElementById("viz");
  chart.classList.add("hidden");

  const selected = document.getElementsByClassName("thumbnail-selected");
  console.log(selected);

  if (selected.length != 0) {
    console.log("removing class" + selected);
    selected[0].classList.remove("thumbnail-selected");
    thumbnail.classList.add("thumbnail-selected");
  } else {
    thumbnail.classList.add("thumbnail-selected");
  }
}

function openMenu() {
  const menu = document.getElementById("pop-up");
  const menuButton = document.getElementById("pop-up-button");
  if (menu.classList.contains("pop-up-expanded")) {
    menu.classList.remove("pop-up-expanded");
    menuButton.classList.remove("rotate");
  } else {
    menu.classList.add("pop-up-expanded");
    menuButton.classList.add("rotate");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const chartLibrary = [];
  const galleryContainer = document.getElementById("gallery-container");

  for (let i = 0; i < chartLibrary.length; i++) {
    let img = new Image();
    img = document.createElement("img");
    img.classList.add("gallery-image");
    img.src = chartLibrary[i];
    galleryContainer.appendChild(img);
  }
});

export async function sendMessage() {
  const messageInput = document.getElementById("input");
  const message = messageInput.value;
  messageInput.value = "";

  printUserMessage(message);
  //Send the string into the nodejs server
  try {
    let responseData = await sendMessageServer(message);

    //The message is show in the chatbox inside the call of get message into the sendMessageServer
    //But the jsons should be displayed if received
    if (responseData.data && responseData.args) {
      printServerMessage('Received both data and args, Creating a new chart....');
      await createLineChart(responseData.data, responseData.args);
    } else if (responseData.data) {
      printServerMessage('Received only data, Creating a new chart....');
      await createLineChart(responseData.data, undefined);
    } else if (responseData.args) {
      printServerMessage('Received only args, Creating a new chart....');
      await createLineChart(undefined, responseData.args);
    } else {
      printServerMessage('No data or args received.');
    }
  } catch (error) {
    console.error(error);
  }
}

//Set user message in the front and set it to the server
export async function printUserMessage(message) {
  if (message.trim() !== "") {
    const chatContainer = document.getElementById("chat");
    const userMessageContainer = document.createElement("div");
    userMessageContainer.classList.add("message-container");

    const userMessage = document.createElement("p");
    userMessage.classList.add("user-message");
    userMessage.textContent = message;

    const messengerID = document.createElement("p");
    messengerID.classList.add("messenger-id");
    messengerID.textContent = "User:";

    userMessageContainer.appendChild(messengerID);
    userMessageContainer.appendChild(userMessage);

    chatContainer.appendChild(userMessageContainer);
  }
}

//Set Bot message inside the chatbox
export function printServerMessage(message) {
  const chatContainer = document.getElementById("chat");
  const chatbotMessageContainer = document.createElement("div");
  chatbotMessageContainer.classList.add("ca-message-container");

  const botMessage = document.createElement("p");
  botMessage.classList.add("received-message");
  botMessage.textContent = message;

  const botMessengerID = document.createElement("p");
  botMessengerID.classList.add("chatbot-id");
  botMessengerID.textContent = "Chatbot:";

  chatbotMessageContainer.appendChild(botMessengerID);
  chatbotMessageContainer.appendChild(botMessage);

  chatContainer.appendChild(chatbotMessageContainer);
}

export function clearChatMessages() {
  const chatContainer = document.getElementById("chat");
  chatContainer.innerHTML = "";
}

function changeColor(elementId, colorClass) {
  const element = document.getElementById(elementId);
  element.className = colorClass;
}
