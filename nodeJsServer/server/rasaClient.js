const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

function logInteraction(user_id, user_message, rasa_response) {
  // Create logs directory if it doesn't exist
  const logsDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const logFilePath = path.join(logsDir, `${user_id}.json`);
  let logData = {};

  // Read existing log file if it exists
  if (fs.existsSync(logFilePath)) {
    const rawData = fs.readFileSync(logFilePath);
    logData = JSON.parse(rawData);
  }

  // Get the next log entry index
  const logIndex = Object.keys(logData).length + 1;

  // Append the new interaction
  logData[logIndex] = {
    user_message,
    rasa_response
  };

  // Write the updated log back to the file
  fs.writeFileSync(logFilePath, JSON.stringify(logData, null, 2));
}

function sendMessageToRasa(message, user_id) {
  return fetch(RASA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ sender: user_id, message }),
  })
  .then(response => response.json())
  .then(data => {
    // Format the response
    const formattedResponse = { message: [], data: {} };
    data.forEach((item) => {
      if (item.text) {
        formattedResponse.message.push(item.text);
      } else {
        formattedResponse.data = item.custom;
      }
    });

    // Log the interaction
    logInteraction(user_id, message, formattedResponse);

    return formattedResponse;
  })
  .catch(error => {
    throw new Error(`Failed to send message to Rasa: ${error.message}`);
  });
}

module.exports = { sendMessageToRasa };
