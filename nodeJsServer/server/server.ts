import dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file

import express from "express";
import session from "express-session";
import passport from "passport";
import passportLocal from "passport-local";
import helmet from "helmet";
const LocalStrategy = passportLocal.Strategy;

// Import user model for authentication and session handling
import User, { IUser } from "../lib/db/models/user";

// Connect to MongoDB using Mongoose
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
mongoose.connect(process.env.MONGODB_URI as string); // Establish a database connection with MongoDB URI

// Import route and websocket setup functions
import { setupRoutes, setupWebsocket } from "./setup-server";

import bodyParser from "body-parser";
import next from "next";
import { authenticate } from "../lib/auth/authenticate";

// Check if running in development mode
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Prepare the Next.js application and start the Express server
app.prepare()
  .then(() => {
    const server = express();

    // Parse incoming JSON and URL-encoded payloads
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    // Configure session middleware with MongoDB storage
    server.use(
      session({
        secret: process.env.AUTH_SECRET as string, // Secret for encrypting session ID
        name: "sessionId", // Name of the session cookie
        resave: false, // Prevents resaving sessions that haven't changed
        saveUninitialized: true, // Save new sessions even if uninitialized
        store: new MongoStore({ // Use MongoDB to store sessions
          mongoUrl: process.env.MONGODB_URI,
          stringify: false,
        }),
        cookie: {
          httpOnly: process.env.NODE_ENV === "production", // Restrict cookie access in production
        },
      })
    );

    // Set up the local authentication strategy using Passport
    const strategy = new LocalStrategy(authenticate);
    passport.use(strategy);

    // Serialize user information to save in session
    //@ts-ignore
    passport.serializeUser((user: IUser, cb) => {
      cb(null, {
        userId: user._id.valueOf(),
        username: user.username
      });
    });

    // Deserialize user information from session
    passport.deserializeUser((session: { userId: string }, cb) => {
      User.findById(session.userId)
        .then((user) => cb(null, user))
        .catch(cb);
    });

    // Initialize Passport middleware and session support
    server.use(passport.initialize());
    server.use(passport.session());

    // Add security headers with Helmet, and disabling CSP for Next.js
    server.use(helmet({
      contentSecurityPolicy: false,
    }));

    // Set up routes for API and other server endpoints
    setupRoutes(server);

    // Handle all remaining requests with Next.js
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    // Start the server
    let httpServer = server.listen(3000, () => {
      console.log("> Ready on http://localhost:3000");
    });

    // Set up WebSocket server
    setupWebsocket(httpServer);
  })
  .catch((ex) => {
    console.error(ex.stack); // Log any startup errors and exit
    process.exit(1);
  });