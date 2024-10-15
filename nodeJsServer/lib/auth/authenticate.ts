import User from "../db/models/user";
import { checkPassword } from "./passwordGestion";

const authenticate = async (
    username: string,
    password: string,
    cb: Function
) => {
    const user = await User.findOne({ username });
    if (!user) return cb(null, false);

    if (!checkPassword(password, user.salt, user.hash)) return cb(null, false);
    return cb(null, user);
};

export { authenticate };
