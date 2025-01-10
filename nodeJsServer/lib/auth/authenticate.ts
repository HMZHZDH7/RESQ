import { User } from "../db/models/user";
import { checkPassword } from "./passwordGestion";

/**
 * Authenticates a user based on the provided username and password.
 * 
 * @param {string} username - The username of the user trying to authenticate.
 * @param {string} password - The password provided by the user.
 * @param {Function} cb - A callback function to return the authentication result.
 * @returns {Promise<void>} - The callback function is called with either an error or the authenticated user.
 */
const authenticate = async (
    username: string,
    password: string,
    cb: Function
): Promise<void> => {
    const user = await User.findOne({ username });
    if (!user) return cb(null, false);

    if (!checkPassword(password, user.salt, user.hash)) return cb(null, false);
    return cb(null, user);
};

export { authenticate };
