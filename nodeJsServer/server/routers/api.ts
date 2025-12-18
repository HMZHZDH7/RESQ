import express from "express";
import type { Express } from "express";
import dataApi from "./api/data";

const api = express.Router();

api.use("*", (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Invalid or missing user session!" })
    else next();
});

api.get("/", (req, res) => {
    res.json({ status: "Ok!" });
});

api.use("/data", dataApi);

export default (server: Express) => {
    server.use("/api", api);
};