const fetch = require('node-fetch');

const RASA_URL = 'http://localhost:5005/webhooks/rest/webhook';

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
      console.log(data);
      const formattedResponse = { message: {}, data: {} };
      data.forEach((item, index) => {
        if (item.text) {
          formattedResponse.message[index + 1] = item.text;
        }
        else {
          formattedResponse.data[index + 1] = item.custom;
        }
      });
      return formattedResponse;
    })
    .catch(error => {
      throw new Error(`Failed to send message to Rasa: ${error.message}`);
    });
}

module.exports = { sendMessageToRasa };
