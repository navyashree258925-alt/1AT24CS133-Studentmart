import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import Product from "./models/Product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({
  path: resolve(__dirname, ".env"),
});

async function seedProducts() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the server .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // UPDATE EXISTING CALCULATOR PRODUCTS
    const calculatorResult = await Product.updateMany(
      { name: { $regex: "calculator", $options: "i" } },
      {
        $set: {
          price: 199,
          imageUrl: "/images/scientific-calculator.jpg",
        },
      },
    );

    // CHECK WHETHER SCIENTIFIC CALCULATOR EXISTS
    const scientificCalculator = await Product.findOne({
      name: /^Scientific Calculator$/i,
    });

    // CREATE IT ONLY IF IT DOES NOT EXIST
    if (!scientificCalculator) {
      await Product.create({
        name: "Scientific Calculator",
        price: 199,
        category: "Stationery",
        stock: 16,
        description:
          "Scientific calculator for engineering students and everyday calculations.",
        imageUrl: "/images/scientific-calculator.jpg",
      });

      console.log("Scientific Calculator created");
    }

    // UPDATE EXISTING NOTEBOOK PRODUCTS
    const notebookResult = await Product.updateMany(
      { name: { $regex: "notebook", $options: "i" } },
      {
        $set: {
          imageUrl: "/images/study-notebook.jpg",
        },
      },
    );

    // CHECK WHETHER STUDY NOTEBOOK EXISTS
    const studyNotebook = await Product.findOne({
      name: /^Study Notebook$/i,
    });

    // CREATE IT ONLY IF IT DOES NOT EXIST
    if (!studyNotebook) {
      await Product.create({
        name: "Study Notebook",
        price: 120,
        category: "Stationery",
        stock: 30,
        description: "Good-quality notebook for college notes and daily study.",
        imageUrl: "/images/study-notebook.jpg",
      });

      console.log("Study Notebook created");
    }

    console.log("Calculator records updated:", calculatorResult.modifiedCount);

    console.log("Notebook records updated:", notebookResult.modifiedCount);

    console.log("Product image updates completed!");

    const totalProducts = await Product.countDocuments();
    console.log("Total products in database:", totalProducts);
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

seedProducts();
