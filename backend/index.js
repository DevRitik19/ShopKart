import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Enable CORS with credentials for local development & frontend ports
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        );
        res.setHeader(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        );
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

let dbPromise = null;
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return;
    if (!dbPromise) {
        dbPromise = mongoose
            .connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 8000,
            })
            .then(() => {
                console.log("MongoDB connected");
            })
            .catch((err) => {
                dbPromise = null;
                console.error("MongoDB connection error:", err);
                throw err;
            });
    }
    await dbPromise;
};

// Database connection readiness check
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: "Database connection failed. Please whitelist your IP in MongoDB Atlas (Network Access -> 0.0.0.0/0).",
            detail: error.message,
        });
    }
});



// Routes
app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// API-prefixed fallbacks
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;