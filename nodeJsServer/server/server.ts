import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import passport from "passport";
import passportLocal from "passport-local";
import helmet from "helmet";
const LocalStrategy = passportLocal.Strategy;

/* Models */
import User, { IUser } from "../lib/db/models/user";

/* Database connection */
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
mongoose.connect(process.env.MONGODB_URI as string);

/* Routes */
import { setupRoutes, setupWebsocket } from "./setup-server";

import bodyParser from "body-parser";
import next from "next";
import { authenticate } from "../lib/auth/authenticate";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    const server = express();
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(
      session({
        secret: process.env.AUTH_SECRET as string,
        name: "sessionId",
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({
          mongoUrl: process.env.MONGODB_URI,
          stringify: false,
        }),
        cookie: {
          httpOnly: process.env.NODE_ENV === "production",
        },
      })
    );

    //@ts-ignore
    const strategy = new LocalStrategy(authenticate);
    passport.use(strategy);
    //@ts-ignore
    passport.serializeUser((user: IUser, cb) => {
      cb(null, {
        userId: user._id.valueOf(),
        username: user.username
      });
    });
    //@ts-ignore
    passport.deserializeUser((session: { userId: string }, cb) => {
      User.findById(session.userId)
        .then((user) => cb(null, user))
        .catch(cb);
    });
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(helmet({
      contentSecurityPolicy: false, // Désactive CSP
    }));

    setupRoutes(server);

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    let httpServer = server.listen(3000, () => {
      console.log("> Ready on http://localhost:3000");
    });

    setupWebsocket(httpServer);
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
