import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /wishlist/:productId - Add a product to the authenticated user's wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Check if product exists in database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 3. Find current authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        // 4. Duplicate prevention
        const isAlreadyWishlisted = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (isAlreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        // 5. Add product reference and persist
        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GET /wishlist - Retrieve the current authenticated user's populated wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name description price category image stock",
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        // Filter out nulls in case a product was removed from the collection
        const validWishlist = (user.wishlist || []).filter((item) => item !== null);

        return res.status(200).json({
            success: true,
            count: validWishlist.length,
            wishlist: validWishlist,
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// DELETE /wishlist/:productId - Remove a product from the current user's wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate Product ID format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find current authenticated user
        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        // 3. Check if product is in the user's wishlist
        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist",
            });
        }

        // 4. Remove product reference and persist
        user.wishlist.splice(index, 1);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// PATCH /wishlist/:productId/toggle - Bonus Task 23: Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const user = await Customer.findById(req.user._id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (!user.wishlist) {
            user.wishlist = [];
        }

        const index = user.wishlist.findIndex(
            (id) => id.toString() === productId
        );

        if (index !== -1) {
            // Already in wishlist -> remove
            user.wishlist.splice(index, 1);
            await user.save();
            return res.status(200).json({
                success: true,
                isWishlisted: false,
                message: "Product removed from wishlist",
            });
        } else {
            // Not in wishlist -> verify product exists & add
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            user.wishlist.push(productId);
            await user.save();
            return res.status(200).json({
                success: true,
                isWishlisted: true,
                message: "Product added to wishlist",
            });
        }
    } catch (error) {
        console.error("Toggle wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
