const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const url = require('url');
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

app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'admin.html'));
});

let clients = [];
let admins = [];
// Handle WebSocket connections
wss.on('connection', (ws, request) => {
  // Parse the URL to get the query parameters (Admin === 'true')
  const query = url.parse(request.url, true).query;

  // Declare variables to hold user_id and logFileHandle
  let user_id;
  let logFileHandle;

  //Admin logic
  if (query.admin === 'true') {
    admins.push(ws);
    console.log(`New admin connected`);

    // Send the current list of clients to the new admin
    ws.send(JSON.stringify({ type: 'clientList', clients: clients.map(client => client.user_id) }));
  }
  //User logic
  else {
    user_id = uuidv4().split('-')[0];  // Generate a unique user_id and take the first part
    ws.user_id = user_id;

    logFileHandle = rasaClient.setupLogging(user_id); // Create the logging file
    clients.push(ws);
    console.log(`New client connected with user_id: ${user_id}`);

    // Send updated client list to all admins
    const clientListMessage = JSON.stringify({ type: 'clientList', clients: clients.map(client => client.user_id) });
    admins.forEach(admin => {
      if (admin.readyState === WebSocket.OPEN) { admin.send(clientListMessage); }
    });
  }

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    //The case for the client fetching server-based json
    if (parsedMessage.action === 'fetchData') {
      try {
        console.log(`Client asking for ${parsedMessage.json_name}.json`);
        const jsonData = fs.readFileSync(path.join(__dirname, 'server', parsedMessage.dir, `${parsedMessage.json_name}.json`));
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
    if (query.admin === 'true') {
      console.log('Admin disconnected');
      admins = admins.filter(admin => admin !== ws);
    } else {
      console.log(`Client disconnected ${user_id}`);
      fs.closeSync(logFileHandle); // Close the file handle when the connection closes
      clients = clients.filter(client => client !== ws);

      // Send updated client list to all admins
      const clientListMessage = JSON.stringify({ type: 'clientList', clients: clients.map(client => client.user_id) });
      admins.forEach(admin => {
        if (admin.readyState === WebSocket.OPEN) {
          admin.send(clientListMessage);
        }
      });
    }
  });

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

// Start the server
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
