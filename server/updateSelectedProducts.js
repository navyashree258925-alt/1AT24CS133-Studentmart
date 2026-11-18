import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const productsToUpdate = [
  {
    name: "Calculator",
    price: 199,
    imageUrl: "/images/calculator.jpg",
  },
  {
    name: "Scientific Calculator",
    price: 899,
    imageUrl: "/images/scientific-calculator.jpg",
  },
  {
    name: "Study Notebook",
    price: 120,
    imageUrl: "/images/notebook.jpg",
  },
];

async function updateProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    for (const item of productsToUpdate) {
      const product = await Product.findOne({
        name: {
          $regex: `^${item.name}$`,
          $options: "i",
        },
      });

      if (!product) {
        console.log(`Product not found: ${item.name}`);
        continue;
      }

      product.price = item.price;
      product.imageUrl = item.imageUrl;

      await product.save();

      console.log(
        `Updated: ${item.name} | Price: ₹${item.price} | Image: ${item.imageUrl}`,
      );
    }

    console.log("Product update process completed.");
  } catch (error) {
    console.error("Update error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

updateProducts();
