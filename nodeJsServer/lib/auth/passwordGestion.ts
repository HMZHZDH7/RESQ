import crypto from "crypto";

/**
 * Creates a hashed password using PBKDF2 with a random salt.
 * 
 * @param {string} rawPassword - The plain text password to be hashed.
 * @returns {Object} An object containing the salt and the hashed password.
 */
const createPassword = (rawPassword: string) => {
    // Generate a random salt (32 bytes, converted to a hex string)
    const salt = crypto.randomBytes(32).toString("hex");

    // Hash the raw password using the salt, PBKDF2, 25000 iterations, 512-bit key length, and sha512 hashing algorithm
    const hash = crypto
        .pbkdf2Sync(rawPassword, salt, 25000, 512, "sha512")
        .toString("hex");
    return { salt, hash };
};

/**
 * Checks if a raw password matches the stored hash and salt.
 * 
 * @param {string} rawPassword - The plain text password to verify.
 * @param {string} salt - The salt used in the original password hashing.
 * @param {string} hash - The original hashed password to compare against.
 * @returns {boolean} `true` if the password matches, otherwise `false`.
 */
const checkPassword = (rawPassword: string, salt: string, hash: string) => {
    const checkHash = crypto
        .pbkdf2Sync(rawPassword, salt, 25000, 512, "sha512")
        .toString("hex");
    return checkHash === hash;
};

export { createPassword, checkPassword };