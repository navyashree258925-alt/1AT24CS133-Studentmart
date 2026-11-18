const express = require("express");
const Student = require("../models/Student.js");
const authMiddleware = require("../middleware/authmiddleware.js");

const router = express.Router();

// Email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Return student details without password
const publicStudent = (student) => ({
  _id: student._id,
  usn: student.usn,
  name: student.name,
  email: student.email,
  phone: student.phone,
  college: student.college,
  course: student.course,
  year: student.year,
});

// VIEW PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      student: publicStudent(student),
    });
  } catch (error) {
    console.error("View profile error:", error);

    return res.status(500).json({
      message: "Unable to retrieve profile.",
    });
  }
});

// UPDATE PROFILE
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, college, course, year } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Name is required.",
      });
    }

    if (typeof email !== "string" || !emailPattern.test(email.trim())) {
      return res.status(400).json({
        message: "Enter a valid email.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether another student already uses this email
    const existingStudent = await Student.findOne({
      email: normalizedEmail,
      _id: { $ne: req.studentId },
    });

    if (existingStudent) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.studentId,
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          phone: typeof phone === "string" ? phone.trim() : "",
          college: typeof college === "string" ? college.trim() : "",
          course: typeof course === "string" ? course.trim() : "",
          year: typeof year === "string" ? year.trim() : "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully.",
      student: publicStudent(student),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update profile.",
    });
  }
});

module.exports = router;
