import mongoose, { ObjectId } from "mongoose";
const Schema = mongoose.Schema;

export interface IUser extends mongoose.Document {
    _id: ObjectId;
    username: string;
    salt: string;
    hash: string;
}

const UserSchema = new Schema<IUser>({
    username: {
        type: String,
        unique: true,
    },
    salt: String,
    hash: String,
});

const UserModel = (mongoose.models.user as mongoose.Model<IUser>) || mongoose.model<IUser>("user", UserSchema);

export default UserModel;
