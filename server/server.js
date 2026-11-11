import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth1.js";
import studentRoutes from "./routes/student.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  }),
);

app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("StudentMart Backend is running!");
});

// Test auth route
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "Auth route is working!" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Backend error:", err);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
  });
