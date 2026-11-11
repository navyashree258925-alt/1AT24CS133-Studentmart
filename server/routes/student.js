import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/student.js";
import auth from "../middleware/authmiddleware.js";

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-\s]{7,15}$/;

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const str = (value) => (typeof value === "string" ? value.trim() : "");

// VIEW PROFILE
router.get("/me", auth, async (req, res, next) => {
  try {
    const student = await Student.findById(req.studentId).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json(student);
  } catch (err) {
    next(err);
  }
});

// EDIT PROFILE
router.put("/me", auth, async (req, res, next) => {
  try {
    const { name, email, phone, college, course, year } = req.body;

    if (!emailPattern.test(str(email))) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (str(phone) && !phonePattern.test(str(phone))) {
      return res.status(400).json({ message: "Enter a valid phone number" });
    }

    if (year && !YEARS.includes(year)) {
      return res.status(400).json({ message: "Invalid year" });
    }

    const normalizedEmail = str(email).toLowerCase();

    const taken = await Student.findOne({
      email: normalizedEmail,
      _id: { $ne: req.studentId },
    });

    if (taken) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.studentId,
      {
        $set: {
          name: str(name),
          email: normalizedEmail,
          phone: str(phone),
          college: str(college),
          course: str(course),
          year: year || "1st Year",
        },
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    return res.json({
      message: "Profile updated successfully",
      student,
    });
  } catch (err) {
    next(err);
  }
});

// CHANGE PASSWORD
router.put("/change-password", auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Fill in both password fields",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const valid = await bcrypt.compare(currentPassword, student.password);

    if (!valid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    student.password = await bcrypt.hash(newPassword, 10);
    await student.save();

    return res.json({
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
