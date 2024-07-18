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

function logInteraction(fileHandle, userTimestamp, userMessage, rasaTimestamp, rasaResponse) {
  const logEntries = [];

  // User message log entry
  logEntries.push({ timestamp: userTimestamp, message: { str: userMessage, srv: false } });

  // Rasa response log entries
  rasaResponse.message.forEach(response => {
    logEntries.push({ timestamp: rasaTimestamp, message: { str: response.str, srv: response.srv } });
  });

  // Log the data if present
  if (rasaResponse.data) {
    logEntries.push({
      timestamp: rasaTimestamp,
      data: { data: rasaResponse.data?.data?.file_content,
        args: rasaResponse.data?.args?.file_content }
    });
  }

  // Read the existing content of the file and parse it
  let logArray;
  try {
    const fileContent = fs.readFileSync(fileHandle, 'utf8');
    logArray = JSON.parse(fileContent);
  } catch (error) {
    logArray = [];
  }

  // Append the new log entries and write it
  logArray = logArray.concat(logEntries);
  fs.writeFileSync(fileHandle, JSON.stringify(logArray, null, 2));
}

// Function to log a single entry
function logSingleEntry(fileHandle, message, isServer) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp: timestamp,
    message: { str: message, srv: isServer }
  };

  // Read the existing content of the file and parse it
  let logArray;
  try {
    const fileContent = fs.readFileSync(fileHandle, 'utf8');
    logArray = JSON.parse(fileContent);
  } catch (error) {
    logArray = [];
  }

  // Append the new log entry
  logArray.push(logEntry);

  // Write the updated log array back to the file
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

function parseLogsToSend(logs) {
  const messageLogs = logs.filter(log => log.message !== undefined).map(log => log.message);

  const dataMap = logs.reduce((acc, log) => {
    if (log.data) {
      if (log.data.data !== undefined) {
        acc.data = log.data.data;
      }
      if (log.data.args !== undefined) {
        acc.args = log.data.args;
      }
    }
    return acc;
  }, { data: null, args: null });

  return {
    message: messageLogs,
    data: dataMap
  };
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
        formattedResponse.message.push({str :item.text, srv : true});
        //{str : , srv:true}
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

module.exports = { sendMessageToRasa, setupLogging, logInteraction, logSingleEntry, getUserLoggedList, parseLogsToSend };
