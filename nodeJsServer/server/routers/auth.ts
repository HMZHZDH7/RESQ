import express from "express";
import type { Express } from "express";
import passport from "passport";

const auth = express.Router();
import register from "./auth/register";

auth.post("/", function (req, res, next) {
    passport.authenticate(
        "local",
        function (err: Error, user: boolean, info: { message: string }) {
            if (user === false) {
                //@ts-ignore
                res.redirect("/login?a=2");
            } else {
                req.login(user, function (err) {
                    if (err) {
                        next(err);
                    } else if (req.body.rememberMe) {
                        req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
                    } else {
                        req.session.cookie.expires = undefined;
                    }
                    res.redirect(`/dashboard`);
                });
            }
        }
    )(req, res, next);
});

auth.get("/as-guest", (req, res, next) => {
    if (!req.user) {
        req.login({ userId: "0", username: "guest" }, (err) => {
            if (err) next(err)
            else {
                req.session.cookie.expires = undefined;
                res.redirect("/dashboard")
            };
        });
    }
    else res.redirect("/dashboard");
})

auth.use("/register", register);

export default (server: Express) => {
    server.use("/auth", auth);
};