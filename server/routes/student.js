import express from "express";
import bcrypt from "bcryptjs";
import Student from "../models/Student.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

// GET STUDENT PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({ student });
  } catch (error) {
    res.status(500).json({
      message: "Unable to get student profile",
    });
  }
});

// UPDATE STUDENT PROFILE
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, college, course, year } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingEmail = await Student.findOne({
      email: normalizedEmail,
      _id: { $ne: req.studentId },
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email is already in use",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.studentId,
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone || "",
        college: college || "",
        course: course || "",
        year: year || "2nd Year",
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      student,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      message: "Unable to update profile",
    });
  }
});

// CHANGE PASSWORD
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Enter both current and new passwords",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must contain at least 6 characters",
      });
    }

    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, student.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    student.password = await bcrypt.hash(newPassword, 10);

    await student.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Password change error:", error);

    res.status(500).json({
      message: "Unable to change password",
    });
  }
});

export default router;
