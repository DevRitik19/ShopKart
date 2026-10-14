import express from "express";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    toggleWishlist,
} from "../controllers/wishlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(authMiddleware);

// GET /wishlist - Get current user's populated wishlist
router.get("/", getWishlist);

// POST /wishlist/:productId - Add product to wishlist
router.post("/:productId", addToWishlist);

// DELETE /wishlist/:productId - Remove product from wishlist
router.delete("/:productId", removeFromWishlist);

// PATCH /wishlist/:productId/toggle - Bonus: Toggle product in wishlist
router.patch("/:productId/toggle", toggleWishlist);

export default router;
