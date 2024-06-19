// WebSocket
let ws;

// Variables for plotting
let yAxis = 'Age';
let xAxis = 'Gender';
let plotType = 'line';
let trendLineChecked = false;
let errorBarChecked = false;
let nationalValuesChecked = false;
let selectedHospitals = [];
let xy = {};

// Connect to WebSocket when the script is loaded
window.onload = () => {
    connectWebSocket();
    fetchData().then(setupEventListeners);
};

// Function to connect to WebSocket
function connectWebSocket() {
    ws = new WebSocket('ws://localhost:3000');
    ws.onopen = () => {
        console.log('Connected to the WebSocket server');
    };
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data);
    };
    ws.onclose = () => {
        console.log('Disconnected from the WebSocket server');
    };
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

// Function to fetch data and set up dropdowns
async function fetchData() {
    try {
        const response = await fetch('../data/hobbit.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        xy = await response.json();
        generateXAndYAxisDropdowns();
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

// Function to generate dropdown options for X and Y axes
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
}

// Function to set up event listeners
async function setupEventListeners() {
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
    for (let i = 0; i < thumbnails.length; i++) {
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
    const plotTypeSelect = document.getElementById("plot-type-select");
    plotTypeSelect.addEventListener("change", (event) => {
        plotType = event.target.value;
    });
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

// Function to show image
export function showImage(thumbnail) {
    console.log(thumbnail);
    const overlay = document.getElementById("overlay");
    overlay.src = thumbnail.src;
    overlay.classList.remove("hidden");

    const chart = document.getElementById("viz");
    chart.classList.add("hidden");

    const selected = document.getElementsByClassName("thumbnail-selected");
    if (selected.length != 0) {
        selected[0].classList.remove("thumbnail-selected");
    }
    thumbnail.classList.add("thumbnail-selected");
}

// Function to open menu
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

// Function to send a message
async function sendMessage() {
    const messageInput = document.getElementById("input");
    const message = messageInput.value;

    if (message.trim() !== "") {
        const chatContainer = document.getElementById("chat");
        const userMessageContainer = document.createElement("div");
        userMessageContainer.classList.add("message-container");
        const chatbotMessageContainer = document.createElement("div");
        chatbotMessageContainer.classList.add("ca-message-container");

        // User message
        const userMessage = document.createElement("p");
        userMessage.classList.add("user-message");
        userMessage.textContent = message;

        const messengerID = document.createElement("p");
        messengerID.classList.add("messenger-id");
        messengerID.textContent = "User:";

        userMessageContainer.appendChild(messengerID);
        userMessageContainer.appendChild(userMessage);

        // Ship it to frontend
        chatContainer.appendChild(userMessageContainer);

        // Send message through WebSocket
        ws.send(JSON.stringify({ message }));

        messageInput.value = "";
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

    await fetchData();
    await setupEventListeners();
});
