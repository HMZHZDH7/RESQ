import dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file

import mongoose from "mongoose";
import UserModel from "./lib/db/models/user";
import { createPassword } from "./lib/auth/passwordGestion";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function manageAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        const adminUser = await UserModel.findOne({ username: "admin" });

        console.log(adminUser ? "An administrator already exists." : "No administrator found. An account will be created.");

        rl.question("\nEnter the password to be used for the administrator account: ", async (password) => {
            const newPassWord = createPassword(password);

            if (adminUser) {
                adminUser.hash = newPassWord.hash;
                adminUser.salt = newPassWord.salt;

                await adminUser.save();
            } else {
                const newAdmin = new UserModel({
                    username: "admin",
                    role: "admin",
                    hash: newPassWord.hash,
                    salt: newPassWord.salt
                });

                await newAdmin.save();
            };

            console.log(adminUser ? "\nThe administrator password has been updated!" : "A new administrator has been successfully created!");
            rl.close();
            mongoose.connection.close();
        });
    } catch (error) {
        console.error("\nAn error has occurred:", error);
        rl.close();
        mongoose.connection.close();
    }
}

manageAdminPassword();