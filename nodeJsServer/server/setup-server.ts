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
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            res.redirect("/login");
        }
    });

    server.use("/dashboard", (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/login");
        }
    });

    server.get("/dashboard", (req, res, next) => {
        res.redirect("/dashboard/statistics")
    })

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
            res.redirect("/login?a=1");
        });
    });
}

function setupWebsocket(server: Server) {
    ws(server);
};

export { setupRoutes, setupWebsocket };
