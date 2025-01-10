import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * Interface representing a session document in MongoDB.
 * @interface ISession
 * @extends {mongoose.Document}
 */
export interface ISession extends mongoose.Document {
    _id: string; // Unique identifier for the session
    expires: Date; // The expiration date for the session
    session: {
        cookie: Object; // Contains cookie-related information
        passport: {
            user: {
                userId: string; // The user ID associated with the session
                role: "guest" | "user" | "admin"; // The user's role, which can be one of "guest", "user", or "admin"
            };
        };
    };
}

/**
 * Schema for creating session documents in MongoDB.
 * This schema contains session information, including the session's expiration and the associated user.
 * @type {mongoose.Schema<ISession>}
 */
const SessionSchema: mongoose.Schema<ISession> = new Schema<ISession>(
    {
        _id: {
            type: String,
        },
        expires: {
            type: Date,
            required: true,
        },
        session: {
            cookie: Object,
            passport: {
                user: {
                    userId: String,
                    role: String,
                },
            },
        },
    },
    {
        strict: false,
    }
);

/**
 * Session model representing the 'session' collection in MongoDB.
 * This model allows interaction with the session data in the database, enabling you to query or modify sessions.
 * @type {mongoose.Model<ISession>}
 */
const SessionModel: mongoose.Model<ISession> = (mongoose.models.session as mongoose.Model<ISession>) || mongoose.model<ISession>("session", SessionSchema);

export { SessionModel as Session };
