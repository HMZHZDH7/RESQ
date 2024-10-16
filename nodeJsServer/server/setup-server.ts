import api from "./routers/api";
import auth from "./routers/auth";
import ws from "./routers/ws";
import type { Express } from "express";
import { Server } from "http";

function setupRoutes(server: Express) {
    /* Routers */
    api(server);
    auth(server);

    /* Routes */

    server.get("/", (req, res) => {
        res.redirect("/dashboard/statistics");
    });

    // server.use("/dashboard", (req, res, next) => {
    //     if (req.isAuthenticated()) {
    //         next();
    //     } else {
    //         res.redirect("/login");
    //     }
    // });

    server.get("/login", (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            next();
        }
    });

    server.get("/register", (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            next();
        }
    });

    server.get("/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            //@ts-ignore
            req.session.justDisconnected = true;
            res.redirect("/login");
        });
    });
}

function setupWebsocket(server: Server) {
    ws(server);
};

export { setupRoutes, setupWebsocket };
