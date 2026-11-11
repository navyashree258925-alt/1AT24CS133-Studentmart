
const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Correct email validation pattern
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Return user details without password
const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  department: user.department,
  year: user.year,
  address: user.address,
});

// VIEW PROFILE
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({ user: publicUser(user) });
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
    const { name, email, phone, department, year, address } = req.body;

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

    // Check whether another user already uses this email
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          name: name.trim(),
          email: normalizedEmail,
          phone: typeof phone === "string" ? phone.trim() : "",
          department: typeof department === "string" ? department.trim() : "",
          year: typeof year === "string" ? year.trim() : "",
          address: typeof address === "string" ? address.trim() : "",
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.json({
      message: "Profile updated successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Unable to update profile.",
    });
  }
});

module.exports = router;
