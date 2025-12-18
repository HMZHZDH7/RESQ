import dotenv from "dotenv";
// Load environment variables from a .env file into process.env
dotenv.config();

import mongoose from "mongoose";
import { User } from "./lib/db/models/user";
import { createPassword } from "./lib/auth/passwordGestion";
import readline from "readline";

// Create an interface to read input and output to the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function manageAdminPassword() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        // Check if an administrator account already exists in the database
        const adminUser = await User.findOne({ username: "admin" });

        console.log(adminUser ? "An administrator already exists." : "No administrator found. An account will be created.");

        // Prompt the user to enter a password for the admin account
        rl.question("\nEnter the password to be used for the administrator account: ", async (password) => {
            // Generate a hash and salt for the entered password
            const newPassWord = createPassword(password);

            if (adminUser) {
                // If the admin account exists, update its password hash and salt
                adminUser.hash = newPassWord.hash;
                adminUser.salt = newPassWord.salt;

                await adminUser.save();
            } else {
                // If no admin account exists, create a new one with the provided password
                const newAdmin = new User({
                    username: "admin",
                    role: "admin",
                    hash: newPassWord.hash,
                    salt: newPassWord.salt
                });

                await newAdmin.save();
            };

            console.log(adminUser ? "\nThe administrator password has been updated!" : "A new administrator has been successfully created!");

            // Close the readline interface and database connection
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