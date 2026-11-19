import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";

dotenv.config();

async function createAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Please configure ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env",
      );
    }

    if (ADMIN_PASSWORD.length < 6) {
      throw new Error("Admin password must contain at least 6 characters");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("This Admin account already exists.");
      } else {
        console.log(
          "This email already belongs to a non-Admin account. Choose a different Admin email.",
        );
      }

      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await User.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully!");
    console.log("Admin email:", email);
  } catch (error) {
    console.error("Admin creation error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
