# RESQ Project

The **RESQ Project** is a Node.js server-based system that integrates with a Rasa conversational AI framework running inside Docker containers. It features a web interface for user interactions and provides an admin dashboard for managing the application.

## Table of Contents

-   [Overview](#overview)
-   [Getting Started](#getting-started)
-   [Architecture Overview](#architecture-overview)
-   [Advanced Usage](#advanced-usage)
-   [Remaining Work](#remaining-work)
-   [Suggestions](#suggestions)
-   [Useful Links and Documentation](#useful-links-and-documentation)
-   [Recommended VSCode Extensions and Configuration](#recommended-vscode-extensions-and-configuration)
-   [Need Help?](#need-help)

## Overview

This project uses a **Node.js** server powered by **Express.js** for managing WebSocket communication and API endpoints. The web interface is built using **Next.js**, a React-based framework, styled with **Tailwind CSS**. The conversational AI capabilities are powered by **Rasa**, which runs inside Docker containers for easy deployment and scaling.

The project consists of three main components:

-   **Express.js Server**: Responsible for API communication and WebSocket handling.
-   **Next.js**: Provides a modern web interface for users and administrators.
-   **Rasa in Docker**: Powers the natural language understanding (NLU) and machine learning (ML) models for chatbots.

## Getting Started

### Prerequisites

To run this project, you will need:

-   **Node.js** installed (>= v18.18)
-   **Docker** and **Docker Compose** installed

### Development Mode

#### Clone the Repository

1. Clone the repository and navigate to the project directory:
    ```bash
    git clone --branch <branch-name> <the-repo-url>
    cd resq-project
    ```

#### Docker Setup (in "RasaxDocker" directory)

1. Launch the Rasa containers:

    ```bash
    docker compose up -d RasaxDocker actions
    ```

2. Install and launch the MongoDB container:
    ```bash
    docker pull mongodb/mongodb-community-server:latest
    docker run --name mongodb -p 27017:27017 -d --restart always mongodb/mongodb-community-server:latest
    ```

#### Node.js Setup (in "nodeJsServer" directory)

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a `.env` file with the following parameters:

    ```env
    NEXT_TELEMETRY_DEBUG=1  # For detailed build logs
    AUTH_SECRET=<your-secret>  # Required for session cookies
    MONGODB_URI=mongodb://localhost:27017/resq  # Required, default for local DB
    PORT=3000  # Optional, specify a custom port
    NEXT_PUBLIC_BASE_PATH=  # Optional, specify a base path for the app
    ```

3. Create or modify the admin user in the dashboard database:

    ```bash
    npm run edit-admin
    ```

    This command will prompt for the admin account password and save it to the database.

4. Start the development server:

    ```bash
    npm run dev
    ```

5. Access the dashboard at [http://localhost:3000](http://localhost:3000)

### Production Mode

#### Clone the Repository

1. Clone the repository and navigate to the project directory:
    ```bash
    git clone --branch <branch-name> <the-repo-url>
    cd resq-project
    ```

#### Docker Setup (in "RasaxDocker" directory)

1. Launch the Rasa containers:

    ```bash
    docker compose up -d RasaxDocker actions
    ```

2. Install and launch the MongoDB container:
    ```bash
    docker pull mongodb/mongodb-community-server:latest
    docker run --name mongodb -p 27017:27017 -d --restart always mongodb/mongodb-community-server:latest
    ```

#### Node.js Setup (in "nodeJsServer" directory)

1. Install dependencies:

    ```bash
    npm install
    ```

2. Create a `.env` file with the following parameters:

    ```env
    NEXT_TELEMETRY_DEBUG=1  # For detailed build logs
    AUTH_SECRET=<your-secret>  # Required for session cookies
    MONGODB_URI=mongodb://localhost:27017/resq  # Required, default for local DB
    PORT=3000  # Optional, specify a custom port
    NEXT_PUBLIC_BASE_PATH=  # Optional, specify a base path for the app
    ```

3. Create or modify the admin user in the dashboard database:

    ```bash
    npm run edit-admin
    ```

    This command will prompt for the admin account password and save it to the database.

4. Build the production version of the dashboard:

    ```bash
    npm run build
    ```

5. Install **PM2** globally:

    ```bash
    npm install -g pm2
    ```

6. Ensure the user running **PM2** has proper permissions for the project directory. If needed, update ownership and permissions:

    ```bash
    sudo chown -R <user>:<group> .  # (e.g., sudo chown -R yc22ni@create.aau.dk:yc22ni@create.aau.dk .)
    sudo chmod -R 755 .
    ```

7. Start the production server with **PM2** (never with the sudo command):

    ```bash
    pm2 start npm --name "New dashboard RESQ" -- start
    ```

8. Configure **PM2** to restart the app on system reboot:

    ```bash
    pm2 startup
    ```

    Copy the generated command and execute it with `sudo`.

9. Save the PM2 process list to ensure the app restarts after a system reboot:
    ```bash
    pm2 save
    ```

## Architecture Overview

### Node.js Server

The **Node.js** server forms the core of the web application and is responsible for managing both the client-side chat functionality and the admin interface. The architecture of the server is divided into two main parts:

1. **Express.js**:

    - Manages WebSocket connections for real-time communication.
    - Handles APIs for various functionalities such as user authentication and interaction with the chatbot.
    - Implements user authentication and access controls to restrict access to certain pages and redirect unauthorized users as necessary.

2. **Next.js**:
    - Provides the front-end interface for the dashboard.
    - Includes the following key pages:
        - **/login**: The login page where users can authenticate.
        - **/dashboard/statistics**: Displays all the charts.
        - **/dashboard/chat**: A dedicated page for interacting with the chatbot in real time.

To access the admin interface, users must log into the dashboard using the username "admin" and the password defined via the `npm run edit-admin` script.

#### File and Folder Structure

```
nodeJsServer/
├── app/                  # Contains the main application logic
├── components/           # Includes reusable React components
│   ├── contexts/         # Manages context providers for global state management
├── data/                 # Stores the data to be displayed in the application
│   ├── sections.ts       # Defines the sections to be displayed on the statistics page
├── lib/                  # Contains utility functions used throughout the project
├── public/               # Hosts static assets such as images and scripts accessible by the client
├── server/               # Houses the Express.js code for handling APIs, authentication, and WebSocket connections
├── types/                # Contains TypeScript definition files to ensure strong typing
├── edit-admin.ts         # A script for configuring the admin account credentials
├── nodemon.json          # Configuration file for Nodemon to streamline development with automatic server restarts
```

### MongoDB

The project uses **MongoDB** to store user information and session data:

-   **Users**:

    -   Stores details such as usernames, hashed passwords, and roles (e.g., admin or regular user).
    -   Facilitates user authentication and access control.

-   **Sessions**:
    -   Tracks active user sessions to manage login states.
    -   Ensures secure and seamless user experience across different parts of the application.

### Rasa with Docker

The project uses Docker to run Rasa services in isolated environments:

-   **RasaxDocker**: This container runs the core Rasa server. It serves the chatbot model and handles API requests.
-   **Actions Container**: This container is responsible for custom actions that the chatbot can trigger. The code for these actions resides in the `actions/` directory, and they are automatically reloaded when changed.

-   **Train Container**: Used to train a new Rasa model based on updated training data. This container is only run when training is required.

-   **Test Container**: Used to test the accuracy and performance of the chatbot model. This container is only run for testing purposes.

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

### Setting a BasePath for the Application

A basePath is a prefix added to all URLs of the application, useful for deploying in subdirectories or behind a reverse proxy.
To set a basePath for the application, you need to define the environment variable `NEXT_PUBLIC_BASE_PATH`. For example:

```bash
NEXT_PUBLIC_BASE_PATH=/new-dashboard
```

#### Express.js Integration

In Express.js, the basePath is automatically handled for accessing pages, applying middlewares, and managing redirections. No additional configuration is required for basic usage.

#### Next.js Integration

In Next.js, the basePath is also managed automatically, but there are a few constraints:

1. **Links:** Always use the `Link` component from Next.js for navigation to ensure proper basePath handling.
2. **Static Assets and WebSocket Links:** For elements like images, links in script files, or WebSocket connections, the basePath must be explicitly included. Here's an example:

    ```javascript
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH
        ? process.env.NEXT_PUBLIC_BASE_PATH.toLowerCase()
        : "";
    const ws = new WebSocket(`${basePath}/ws`);
    ```

### Configuring Apache as a Reverse Proxy

To deploy the application behind Apache with a basePath, you need to configure a reverse proxy. Ensure the Apache proxy module is installed by running the following commands:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
sudo systemctl restart apache2
```

Then, update the Apache configuration file (e.g., `/etc/apache2/sites-available/000-default.conf`) by adding the following lines:

```apache
# New configuration: Reverse proxy for Express.js
# Redirects requests to /new-dashboard to local Express.js server
ProxyPass "/new-dashboard/ws" "ws://localhost:4200/new-dashboard/ws"
ProxyPassReverse "/new-dashboard/ws" "ws://localhost:4200/new-dashboard/ws"

ProxyPass "/new-dashboard" "http://localhost:4200/new-dashboard"
ProxyPassReverse "/new-dashboard" "http://localhost:4200/new-dashboard"

# Ensure permissions are granted
<Location "/new-dashboard">
    Require all granted
</Location>
```

#### Steps Explained

1. **Enable proxy modules:** The commands above ensure the necessary proxy modules are enabled in Apache.
2. **WebSocket handling:** The `ProxyPass` and `ProxyPassReverse` lines for `/new-dashboard/ws` route WebSocket traffic to the Node.js server.
3. **HTTP traffic handling:** The `ProxyPass` and `ProxyPassReverse` lines for `/new-dashboard` ensure HTTP traffic is proxied correctly to the Node.js server.
4. **Permissions:** The `<Location>` block ensures that all requests to the `/new-dashboard` path are granted access.

After updating the configuration, restart Apache to apply the changes:

```bash
sudo systemctl restart apache2
```

## Remaining Work

Here is a list of tasks that need to be completed for the project:

1. **Add user account creation**:

    - Implement the registration functionality:
        - The `register` page already exists but is currently empty. Populate the page with the appropriate input fields (e.g., username, email, password).
        - Ensure the submitted data is sent to the `/auth/register` endpoint.
    - Validate user input on both the client side and the server side.
    - Handle error messages from the server, such as when the input data is invalid or the user already exists.

2. **Retrieve and display the number of patients**:

    - Add a new API route to return the total number of patients.
    - Create a React component to display this information:
        - Include a loader to show while the data is being fetched.
        - Display the retrieved data once it has been received.
        - You can use the `ChartClient` component as inspiration for the implementation.

3. **Implement the filter system for graphs below the national average**:
    - Modify the server-side code that provides the data for each graph to include a boolean property indicating whether the graph's values are below the national average. The calculation should be performed on the server.
    - Store the value of this boolean property in the `ChartClient` component, and if it is true, display a warning message around the graph.
    - Add a new Context component to globally store the current state of the on/off switch for displaying only graphs below the national average.
    - Link the navbar's on/off switch to the Context.
    - Retrieve the Context parameter value in the component and hide the graph if necessary (use the `cn` function to handle this logic).

## Suggestions

As the project transitions from testing to real deployment, here are critical points to address:

1. **Disable guest login for real deployment**:

    - Ensure that the functionality allowing users to log in as a guest, which is only meant for testing during the user trials, is fully removed before the final deployment to production to prevent unauthorized access.

2. **Strengthen input validation**:
    - Verify and reinforce input validation for all user-submitted data, both on the client side and the server side, to safeguard against potential security risks such as injection attacks or invalid data handling.

## Useful Links and Documentation

Here is a list of documentation resources to help you better understand the tools and technologies used in this project:

### General Resources

-   **Node.js**: [https://nodejs.org/en/docs](https://nodejs.org/en/docs)
-   **Docker**: [https://docs.docker.com](https://docs.docker.com)
-   **MongoDB**: [https://www.mongodb.com/docs](https://www.mongodb.com/docs)
-   **Express.js**: [https://expressjs.com/en/starter/installing.html](https://expressjs.com/en/starter/installing.html)
-   **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
-   **Mongoose**: [https://mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html)
-   **WebSocket API**: [https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
-   **Chart.js**: [https://www.chartjs.org/docs/latest/](https://www.chartjs.org/docs/latest/)
-   **TypeScript**: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

### Rasa Resources

-   **Rasa official documentation**: [https://rasa.com/docs](https://rasa.com/docs)
-   **Rasa Docker setup guide**: [https://rasa.com/docs/rasa/docker/](https://rasa.com/docs/rasa/docker/)
-   **Rasa custom actions**: [https://rasa.com/docs/rasa/custom-actions](https://rasa.com/docs/rasa/custom-actions)
-   **Rasa CLI commands**: [https://rasa.com/docs/rasa/command-line-interface](https://rasa.com/docs/rasa/command-line-interface)

### Frontend Tools

-   **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
-   **React.js**: [https://reactjs.org/docs/getting-started.html](https://reactjs.org/docs/getting-started.html)
-   **React Chart.js**: [https://react-chartjs-2.js.org/](https://react-chartjs-2.js.org/)

### Deployment and Management Tools

-   **PM2 documentation**: [https://pm2.keymetrics.io/docs/usage/quick-start/](https://pm2.keymetrics.io/docs/usage/quick-start/)
-   **Apache reverse proxy guide**: [https://httpd.apache.org/docs/current/mod/mod_proxy.html](https://httpd.apache.org/docs/current/mod/mod_proxy.html)

## Recommended VSCode Extensions and Configuration

As part of this project, we recommend the following VSCode extensions and configurations to improve your development workflow and ensure optimal productivity:

### Error Lens

Error Lens highlights errors and warnings directly in the editor, making them much easier to spot. Instead of only relying on the Problems tab, you'll see inline annotations near the code that has issues. This saves time and ensures that you can address problems as soon as they arise.

### Tailwind CSS IntelliSense

Tailwind CSS IntelliSense provides advanced features like autocomplete, syntax highlighting, and linting for Tailwind CSS. These features speed up development and reduce errors when working with Tailwind.

#### Configuration for cva and cx Functions

To enable autocomplete for Tailwind classes in user-defined functions like `cva` and `cx`, you need to modify the `tailwindCSS.experimental.classRegex` setting in your VSCode configuration. Add the following to your settings:

```json
"tailwindCSS.experimental.classRegex": [
    [
        "cva\\(([^)]*)\\)",
        "[\"'`]([^\"'`]*)[\"'`]"
    ],
    [
        "cx\\(([^)]*)\\)",
        "(?:'|\"|`)([^']*)(?:'|\"|`)"
    ]
]
```

This configuration enables Tailwind IntelliSense to recognize and provide suggestions for class names used in these functions, improving your development workflow when using utility-first CSS approaches.

### JavaScript and TypeScript Nightly

JavaScript and TypeScript Nightly enhances support for working with JavaScript and TypeScript projects in VSCode, ensuring compatibility and better performance for TypeScript-related features.

## Need Help?

If you have any questions or encounter issues with the setup, feel free to reach out to me on Discord. My username is: `shirayu_`
