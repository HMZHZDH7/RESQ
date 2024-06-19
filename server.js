const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.vendor.config');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware to serve static files from 'client'
app.use(express.static(path.join(__dirname, 'client')));

// Bundle and serve vendor files
const compiler = webpack(webpackConfig);
compiler.run((err, stats) => {
  if (err || stats.hasErrors()) {
    console.error(err || stats.toJson().errors);
  } else {
    console.log('Vendor bundle created successfully.');
  }
});

// Serve bundled vendor file
app.use('/dist', express.static(path.join(__dirname, 'client', 'dist')));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Handle WebSocket connections
wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.action === 'fetchData') {
      console.log(`Client asking for ${parsedMessage.json_name}`);
      const jsonData = fs.readFileSync(path.join(__dirname, 'client', 'data', `${parsedMessage.json_name}.json`));
      ws.send(JSON.stringify({
        requestId: parsedMessage.requestId,
        json_name: parsedMessage.json_name,
        data: JSON.parse(jsonData),
      }));
    } else if (parsedMessage.message) {
      // Handle other message actions if necessary
      ws.send(JSON.stringify({
        requestId: parsedMessage.requestId,
        message: 'Your message has been received',
        data: {} // Add any additional data if needed
      }));
    } else {
      console.log(`Received: ${message}`);
    }
  });

  ws.send(JSON.stringify({ message: 'Hello from server' }));

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
});

// Start the server
server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
