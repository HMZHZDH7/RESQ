import crypto from "crypto";

const createPassword = (rawPassword: string) => {
    const salt = crypto.randomBytes(32).toString("hex");
    const hash = crypto
        .pbkdf2Sync(rawPassword, salt, 25000, 512, "sha512")
        .toString("hex");
    return { salt, hash };
};

const checkPassword = (rawPassword: string, salt: string, hash: string) => {
    const checkHash = crypto
        .pbkdf2Sync(rawPassword, salt, 25000, 512, "sha512")
        .toString("hex");
    return checkHash === hash;
};

export { createPassword, checkPassword };
