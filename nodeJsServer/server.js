const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { v4: uuidv4 } = require('uuid'); // Import uuid to generate unique IDs

const webpackConfig = require('./webpack.vendor.config');
const rasaClient = require('./server/rasaClient');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Bundle and serve vendor files
const compiler = webpack(webpackConfig);
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.toJson().errors);
  } else {
    console.log('Vendor bundle created successfully.');

    // Serve bundled vendor file
    app.use('/dist', express.static(path.join(__dirname, 'client', 'dist')));

    compiler.close((closeErr) => {
      if (closeErr) {
        console.error(closeErr);
      }
      else {
        console.log("Compiler closed");
      }
    });
  }
});

// Middleware to serve static files from 'client'
app.use(express.static(path.join(__dirname, 'client')));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  const user_id = uuidv4();  // Generate a unique user_id for this session
  const logFileHandle = rasaClient.setupLogging(user_id); //Create the logging file
  console.log(`New client connected with user_id: ${user_id}`);

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    //The case for the client fetching server-based json
    if (parsedMessage.action === 'fetchData') {
      try {
        console.log(`Client asking for ${parsedMessage.json_name}.json`);
        const jsonData = fs.readFileSync(path.join(__dirname, 'client', 'data', `${parsedMessage.json_name}.json`));
        ws.send(JSON.stringify({
          requestId: parsedMessage.requestId,
          error : false,
          json_name: parsedMessage.json_name,
          data: JSON.parse(jsonData) }));
      }
      catch (error) {
        console.error('Error reading JSON file:', error);
        ws.send(JSON.stringify({
          requestId: parsedMessage.requestId,
          error : true,
          json_name: parsedMessage.json_name,
          message: 'Failed to read JSON file' }));
      }
    }

    //The case for calling a Rasa Request
    else if (parsedMessage.action === 'sendMessageToRasa') {
      let rasaTimestamp = null;
      let userTimestamp = new Date().toISOString();
      console.log(`${user_id} asking : ${parsedMessage.message}`);

      //Sending request to Rasa
      rasaClient.sendMessageToRasa(parsedMessage.message, user_id)
        .then(response => {
          //Cli log
          rasaTimestamp = new Date().toISOString();
          console.log("Response from Rasa Server :");
          console.log(response);

          //Sending client
          ws.send(JSON.stringify({
            requestId: parsedMessage.requestId, //Client-based RequestID for synchronicity
            error : false,
            message: response.message,
            data: response.data
          }));

          //Logging on the file handle : User msg and Rasa Response
          rasaClient.logInteraction(logFileHandle, userTimestamp, parsedMessage.message, rasaTimestamp,  response);
        })
        .catch(error => {
          console.error('Error sending message to Rasa:', error);
          ws.send(JSON.stringify({
            requestId: parsedMessage.requestId,
            error : true,
            message: 'Failed to process message with Rasa',
          }));
        });
    }

    //Get client Message
    //Rasa Response
    //logInteraction
    //Send request administrator
    //admin Response
    //logInteraction
    //send client

    else {
      console.log(`Received: ${message}`);
    }
  });

  //Welcome Message
  ws.send(JSON.stringify({ message: 'Hello from server' }));

  ws.on('close', () => {
    console.log(`Client disconnected ${user_id}\n`);
    fs.closeSync(logFileHandle); // Close the file handle when the connection closes
  });

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

// Start the server
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
