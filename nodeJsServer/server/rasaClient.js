const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

//One file per client to solve concurrency problems
function setupLogging(userId) {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  //Create file and return handle
  const logFilePath = path.join(logsDir, `${userId}.json`);
  const fileHandle = fs.openSync(logFilePath, 'a');
  return fileHandle;
}

//Need to call the setupLogging() before this for getting the filehandle
function logInteraction(fileHandle, userTimestamp, userMessage, rasaTimestamp, rasaResponse) {
  // Create the log entry

  const logEntry = {
    user : {timestamp : userTimestamp, message : userMessage},
    rasa : {timestamp : rasaTimestamp, response : rasaResponse}
  };

  // Append the new interaction
  fs.appendFileSync(fileHandle, JSON.stringify(logEntry, null, 2) + ',\n');
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

module.exports = { sendMessageToRasa, setupLogging, logInteraction };
