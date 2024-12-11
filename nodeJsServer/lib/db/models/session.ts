import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface ISession extends mongoose.Document {
    _id: string;
    expires: Date;
    session: {
        cookie: Object;
        passport: {
            user: {
                userId: string;
                role: "guest" | "user" | "admin";
            };
        };
    };
}

const SessionSchema = new Schema<ISession>(
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

const SessionModel = (mongoose.models.session as mongoose.Model<ISession>) || mongoose.model<ISession>("session", SessionSchema);

export default SessionModel;
