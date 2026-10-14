import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const sampleProducts = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation and 40-hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    stock: 15,
  },
  {
    name: "Mechanical Keyboard",
    description: "Tenkeyless RGB mechanical gaming keyboard with tactile blue switches and aluminum frame.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    stock: 10,
  },
  {
    name: "Ergonomic Wireless Mouse",
    description: "Precision laser sensor with multi-device Bluetooth connectivity and silent click design.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    stock: 25,
  },
  {
    name: "Smart Fitness Watch",
    description: "AMOLED health tracker with 24/7 heart rate, SpO2, sleep monitor, and 5ATM waterproof rating.",
    price: 3499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    stock: 12,
  },
  {
    name: "Classic Denim Jacket",
    description: "Vintage-washed 100% durable cotton denim jacket with reinforced button closures.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80",
    stock: 20,
  },
  {
    name: "Minimalist Leather Backpack",
    description: "Water-resistant vegan leather urban backpack with padded 15.6-inch laptop compartment.",
    price: 3299,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    stock: 8,
  },
  {
    name: "Atomic Habits by James Clear",
    description: "An easy & proven way to build good habits & break bad ones. Best-selling personal growth book.",
    price: 599,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    stock: 30,
  },
  {
    name: "Clean Code by Robert C. Martin",
    description: "A handbook of agile software craftsmanship for writing maintainable and professional code.",
    price: 1199,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=600&auto=format&fit=crop&q=80",
    stock: 18,
  },
  {
    name: "Modern Ceramic Table Lamp",
    description: "Warm LED ambient nightstand lamp with matte terracotta finish and touch dimmer.",
    price: 1899,
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    stock: 14,
  },
  {
    name: "Stainless Steel French Press",
    description: "Double-walled insulated coffee maker with 4-level filtration system for barista-style brew.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    stock: 22,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Remove existing products if any
    await Product.deleteMany({});
    console.log("Cleared old products.");

    // Insert sample products
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Successfully added ${inserted.length} sample products to ShopKart!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
