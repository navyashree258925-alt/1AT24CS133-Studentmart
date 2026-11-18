import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import Product from "../models/Product.js";
import authMiddleware from "../middleware/authmiddleware.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload folder
const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + extension;

    cb(null, uniqueName);
  },
});

// Allow image files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const filter = {};

    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(safeSearch, "i");

      filter.$or = [{ name: searchRegex }, { description: searchRegex }];
    }

    if (category && category !== "All") {
      const safeCategory = category
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      filter.category = {
        $regex: `^${safeCategory}$`,
        $options: "i",
      };
    }

    let query = Product.find(filter);

    if (sort === "low") {
      query = query.sort({ price: 1 });
    } else if (sort === "high") {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch product details",
    });
  }
});

// ADD PRODUCT WITH IMAGE URL OR UPLOADED IMAGE
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      stock,
      description,
      imageUrl: submittedImageUrl,
    } = req.body;

    if (
      !name?.trim() ||
      price === undefined ||
      !category?.trim() ||
      stock === undefined ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required product fields.",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid product price.",
      });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative whole number.",
      });
    }

    // Use uploaded file if provided; otherwise use image URL
    let imageUrl = "";

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (submittedImageUrl?.trim()) {
      try {
        const parsedUrl = new URL(submittedImageUrl.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          return res.status(400).json({
            success: false,
            message: "Please enter a valid HTTP or HTTPS image URL.",
          });
        }

        imageUrl = parsedUrl.href;
      } catch {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid image URL.",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide an image URL or select an image file.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: numericPrice,
      category: category.trim(),
      stock: numericStock,
      imageUrl,
      description: description.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);

    if (req.file) {
      fs.unlink(path.join(uploadDirectory, req.file.filename), () => {});
    }

    res.status(500).json({
      success: false,
      message: error.message || "Unable to add product.",
    });
  }
});

export default router;
