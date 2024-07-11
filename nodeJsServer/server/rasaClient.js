const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

//One file per client to solve concurrency problems
// Function to setup logging for a user
function setupLogging(userId) {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  // Create file if it doesn't exist and initialize with an empty array
  const logFilePath = path.join(logsDir, `${userId}.json`);
  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '[]');
  }
  return logFilePath;
}

// Synchronous logging function
function logInteraction(fileHandle, userTimestamp, userMessage, rasaTimestamp, rasaResponse) {
  const logEntry = {
    user: { timestamp: userTimestamp, message: userMessage },
    rasa: { timestamp: rasaTimestamp, response: rasaResponse }
  };

  // Read the existing content of the file
  const fileContent = fs.readFileSync(fileHandle, 'utf8');
  let logArray;
  try {
    logArray = JSON.parse(fileContent);
  } catch (error) {
    logArray = [];
  }

  // Append the new log entry
  logArray.push(logEntry);
  fs.writeFileSync(fileHandle, JSON.stringify(logArray, null, 2));
}

function getUserLoggedList() {
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    return [];
  }

  const files = fs.readdirSync(logsDir);
  return files.map(file => path.basename(file, '.json'));
}

//Request on Rasa and Parsing Message
function sendMessageToRasa(message, userId) {
  return fetch(RASA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sender: userId, message }),
  })
  .then(response => response.json())
  .then(data => {
    //For each element, pushing string message and args/data json
    const formattedResponse = { message: [], data: {} };
    data.forEach((item) => {
      if (item.text) {
        formattedResponse.message.push(item.text);
      } else {
        formattedResponse.data = item.custom;
      }
    });

    return formattedResponse;
  })
  .catch(error => {
    throw new Error(`Failed to send message to Rasa: ${error.message}`);
  });
}

module.exports = { sendMessageToRasa, setupLogging, logInteraction, getUserLoggedList };
