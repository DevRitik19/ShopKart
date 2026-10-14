import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Helper to populate and sanitize cart items
const getPopulatedCart = async (userId) => {
    const user = await Customer.findById(userId).populate({
        path: "cart.product",
        select: "name price image stock category description",
    });

    if (!user || !user.cart) return [];

    // Filter out null products in case a referenced product was removed
    return user.cart.filter((item) => item.product !== null);
};

// POST /cart/:productId - Add product to cart (or increment if already present)
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find product to check existence and stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 3. Find authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.cart) {
            user.cart = [];
        }

        // 4. Check if product already exists in cart
        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const nextQuantity = existingItem.quantity + 1;
            if (nextQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more. Available stock is ${product.stock}`,
                });
            }
            existingItem.quantity = nextQuantity;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({
                    success: false,
                    message: "Product is out of stock",
                });
            }
            user.cart.push({
                product: productId,
                quantity: 1,
            });
        }

        await user.save();

        const populatedCart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GET /cart - Get current authenticated user's cart
export const getCart = async (req, res) => {
    try {
        const populatedCart = await getPopulatedCart(req.user._id);

        return res.status(200).json({
            success: true,
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// PATCH /cart/:productId - Update product quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Validate quantity value
        const parsedQuantity = Number(quantity);
        if (
            typeof quantity === "undefined" ||
            isNaN(parsedQuantity) ||
            parsedQuantity < 1 ||
            !Number.isInteger(parsedQuantity)
        ) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be an integer and at least 1",
            });
        }

        // 3. Check product existence and available stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        if (parsedQuantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity exceeds available stock (${product.stock})`,
            });
        }

        // 4. Find user and item in cart
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.cart) {
            user.cart = [];
        }

        const cartItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart",
            });
        }

        cartItem.quantity = parsedQuantity;
        await user.save();

        const populatedCart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Quantity updated",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Update cart quantity error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// DELETE /cart/:productId - Remove product from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.cart) {
            user.cart = [];
        }

        const index = user.cart.findIndex(
            (item) => item.product.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in cart",
            });
        }

        user.cart.splice(index, 1);
        await user.save();

        const populatedCart = await getPopulatedCart(user._id);

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: populatedCart,
        });
    } catch (error) {
        console.error("Remove from cart error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
