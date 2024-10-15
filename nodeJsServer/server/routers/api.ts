import express from "express";
import type { Express } from "express";

const api = express.Router();

api.get("/", (req, res) => {
    res.json({ status: "Ok!" });
});

export default (server: Express) => {
    server.use("/api", api);
};
