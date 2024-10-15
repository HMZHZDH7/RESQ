import express from "express";
import User from "../../../lib/db/models/user";
import { createPassword } from "../../../lib/auth/passwordGestion";

const register = express.Router();

register.post("/", async (req, res, next) => {
    if (
        !req.body.username ||
        !req.body.password ||
        !req.body.confirmPassword ||
        req.body.password != req.body.confirmPassword
    )
        return res.redirect("/register?a=1");

    if (await User.findOne({ username: req.body.username }))
        return res.redirect("/register?a=2");

    const { salt, hash } = createPassword(req.body.password);

    const newUser = await User.create({
        username: req.body.username,
        salt,
        hash,
    });

    req.login(newUser, (err) => {
        if (err) next(err);
        else if (req.body.rememberMe) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
        } else {
            req.session.cookie.expires = undefined;
        }
        res.redirect(`/dashboard`);
    });
});

export default register;
