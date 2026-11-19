import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";
import User from "../models/user.js";

const router = express.Router();

// STUDENT REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const { usn, name, email, password } = req.body;

    if (!usn || !name || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must contain at least 6 characters",
      });
    }

    const existingStudent = await Student.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { usn: usn.trim().toUpperCase() },
      ],
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "Email or USN already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      usn: usn.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Registration successful",
      student: {
        id: student._id,
        usn: student.usn,
        name: student.name,
        email: student.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// STUDENT LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const student = await Student.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!student) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      student: {
        id: student._id,
        usn: student.usn,
        name: student.name,
        email: student.email,
        phone: student.phone,
        college: student.college,
        course: student.course,
        year: student.year,
        role: "student",
      },
    });
  } catch (error) {
    console.error("Student login error:", error);

    return res.status(500).json({
      message: "Student login failed",
    });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter email and password",
      });
    }

    const admin = await User.findOne({
      email: email.trim().toLowerCase(),
      role: "admin",
    });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid Admin email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid Admin email or password",
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        department: admin.department,
        year: admin.year,
        address: admin.address,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      message: "Admin login failed",
    });
  }
});

export default router;
