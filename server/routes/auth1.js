import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/student.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const isText = (value) => typeof value === "string" && value.trim() !== "";

const publicStudent = (student) => ({
  _id: student._id,
  usn: student.usn,
  email: student.email,
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { usn, email, password } = req.body;

    if (!isText(usn) || !isText(email) || !isText(password)) {
      return res.status(400).json({
        message: "USN, email and password are required",
      });
    }

    if (!emailPattern.test(email.trim())) {
      return res.status(400).json({
        message: "Enter a valid email",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing in .env",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsn = usn.trim().toUpperCase();

    const exists = await Student.findOne({
      $or: [{ email: normalizedEmail }, { usn: normalizedUsn }],
    });

    if (exists) {
      return res.status(409).json({
        message: "This USN or email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      usn: normalizedUsn,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful",
      token: createToken(student._id),
      student: publicStudent(student),
    });
  } catch (err) {
    console.error("Registration error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "This USN or email already exists",
      });
    }

    return res.status(500).json({
      message: err.message || "Registration failed",
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isText(email) || !isText(password)) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT_SECRET is missing in .env",
      });
    }

    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.json({
      message: "Login successful",
      token: createToken(student._id),
      student: publicStudent(student),
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: err.message || "Login failed",
    });
  }
});

export default router;
