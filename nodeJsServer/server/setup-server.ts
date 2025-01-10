import api from "./routers/api";
import auth from "./routers/auth";
import ws from "./routers/ws";
import type { Express } from "express";
import { Server } from "http";

/**
 * Sets up the routes for the Express server, including middleware and endpoints.
 * 
 * - Configures base path redirection if `NEXT_PUBLIC_BASE_PATH` is defined.
 * - Adds API, authentication, and dashboard routes.
 * - Handles redirection based on authentication status for certain routes.
 * 
 * @param {Express} server - The Express server instance.
 */
function setupRoutes(server: Express) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH.toLowerCase() : undefined;

    // Middleware to handle base path redirection and URL adjustments
    server.use((req, res, next) => {
        if (basePath) {
            const originalRedirect: (url: string) => void = res.redirect;
            res.redirect = (url) => {
                url = basePath + url;
                return originalRedirect.call(res, url);
            };
            if (req.url.startsWith(basePath) && !req.url.startsWith(`${basePath}/ws`)) {
                req.url = req.url.slice(basePath.length);
                if (req.url === "") req.url = "/";
            };
        };
        next();
    });

    /* Routers */
    // Sets up API routes
    api(server);
    // Sets up authentication routes
    auth(server);

    /* Routes */

    /**
     * Root route `/`.
     * Redirects to the dashboard if authenticated, otherwise to the login page.
     */
    server.get("/", (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            res.redirect("/login");
        }
    });

    /**
     * Middleware for `/dashboard` routes.
     * Ensures the user is authenticated before allowing access.
     */
    server.use("/dashboard", (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/login");
        }
    });

    /**
     * Route `/dashboard`.
     * Redirects to `/dashboard/statistics`.
     */
    server.get("/dashboard", (req, res, next) => {
        res.redirect("/dashboard/statistics")
    });

    /**
     * Route `/login`.
     * Redirects authenticated users to `/dashboard/statistics`, otherwise proceeds with the login page.
     */
    server.get("/login", (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            next();
        }
    });

    /**
     * Route `/register`.
     * Redirects authenticated users to `/dashboard/statistics`, otherwise proceeds with the registration page.
     */
    server.get("/register", (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect("/dashboard/statistics");
        } else {
            next();
        }
    });

    /**
     * Route `/logout`.
     * Logs out the user, destroys the session, and redirects to `/login`.
     */
    server.get("/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            req.session.destroy((err) => {
                if (err) next(err)
                else res.redirect("/login?a=1");
            });
        });
    });
};

/**
 * Sets up the WebSocket server.
 * 
 * - Initializes WebSocket handling by invoking the `ws` module.
 * 
 * @param {Server} server - The HTTP server instance.
 */
function setupWebsocket(server: Server) {
    ws(server);
};

export { setupRoutes, setupWebsocket };