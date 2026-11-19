import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth1.js";
import studentRoutes from "./routes/student.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// CURRENT DIRECTORY
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS CONFIGURATION - ALLOW ANY LOCALHOST PORT
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// MIDDLEWARE
app.use(express.json());

// SERVE UPLOADED PRODUCT IMAGES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("StudentMart Backend is Running!");
});

// AUTHENTICATION ROUTES
app.use("/api/auth", authRoutes);

// STUDENT PROFILE ROUTES
app.use("/api/student", studentRoutes);

// PRODUCT ROUTES
app.use("/api/products", productRoutes);

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  });
