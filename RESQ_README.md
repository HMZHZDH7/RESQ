
# RESQ Project

The **RESQ Project** is a Node.js server-based system that integrates with a Rasa conversational AI framework running inside Docker containers. It features a web interface for user interactions and provides an admin dashboard for managing the application.

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Architecture Overview](#architecture-overview)
- [Advanced Usage](#advanced-usage)

## Overview
This project uses a **Node.js** server for serving a client-side chat interface and managing the backend logic. The conversational AI capabilities are powered by **Rasa**, which runs inside Docker containers for easy deployment and scaling.

The project consists of two main components:
- **Node.js Server**: Responsible for the web interface and API communication.
- **Rasa in Docker**: Powers the natural language understanding (NLU) and machine learning (ML) models for chatbots.

## Getting Started

### Prerequisites
To run this project, you will need:
- **Node.js** installed (>= v14.x)
- **Docker** and **Docker Compose** installed

### Installation Steps
1. Clone the repository and navigate to the project directory:
    ```bash
    git clone <your-repo-url>
    cd resq-project
    ```

2. Install Node.js dependencies:
    ```bash
    npm install
    ```

3. Build and start the Docker containers:
    ```bash
    docker-compose up -d RasaxDocker actions
    ```

4. Start the Node.js server:
    ```bash
    node server.js
    ```

5. Access the web interfaces:
   - Chatbox: [http://localhost:3000](http://localhost:3000)
   - Admin Dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

### Basic Docker Commands
- **Check Container Health**: Inspect the health status of the Rasa container:
    ```bash
    docker inspect --format '{{json .State.Health.Status}}' RasaxDocker
    ```

- **View Logs**: Check the logs for debugging or monitoring:
    ```bash
    docker logs RasaxDocker
    ```

## Architecture Overview

### Node.js Server
The **Node.js** server forms the core of the web application and is responsible for managing both the client-side chat functionality and the admin interface. The architecture of the server is divided as follows:

- **Common Client Functions**:
  - **chatbox.js**: Contains the logic for rendering and managing the chat interface that users interact with.
  - **socket.js**: Manages real-time communication between the client and server using WebSockets.
  - **viz.js**: Provides data visualization logic, which can be used for enhancing user or admin interfaces with visual feedback.

- **Client.js**: This is the main script for end users who interact with the AI-powered chatbot. It's responsible for handling user input and forwarding it to the AI model for a response. It powers the web interface available at `http://localhost:3000`.

- **Admin.js**: This script is designed for the admin dashboard, available at `http://localhost:3000/admin`. It allows administrators to monitor users, view their interactions, and manage the chatbot in real time. Admins can even interact with clients through this interface.

### Rasa with Docker
The project uses Docker to run Rasa services in isolated environments:
- **RasaxDocker**: This container runs the core Rasa server. It serves the chatbot model and handles API requests.
  
- **Actions Container**: This container is responsible for custom actions that the chatbot can trigger. The code for these actions resides in the `actions/` directory, and they are automatically reloaded when changed.

- **Train Container**: Used to train a new Rasa model based on updated training data. This container is only run when training is required.

- **Test Container**: Used to test the accuracy and performance of the chatbot model. This container is only run for testing purposes.

## Advanced Usage

### Training a New Model
To train a new model, you need to run the `train` service:
```bash
docker-compose up train
```
This will generate a new model and store it in the `models/` directory.

### Testing a Model
After training, you can test the model using the `test` service:
```bash
docker-compose up test
```
The test results will be outputted in the `results/` directory.

### Rebuilding Docker Containers
If you've made changes to your action server code or need to rebuild the containers, run:
```bash
docker-compose build
```

### Stopping All Containers
To stop the Rasa and action containers, run:
```bash
docker-compose down
```

