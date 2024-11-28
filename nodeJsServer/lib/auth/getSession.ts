import { cookies } from "next/headers";
import Session, { ISession } from "../db/models/session";

async function getSession() {
    const sessionId = cookies()
        .get("sessionId")
        ?.value.split(":")[1]
        .split(".")[0];
    const session: ISession | null = await Session.findById(sessionId);
    return session ? session.session.passport.user : null;
}

export default getSession;
