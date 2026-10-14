import express from "express";
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

// GET /cart - Get current user's cart
router.get("/", getCart);

// POST /cart/:productId - Add product to cart (or increment quantity)
router.post("/:productId", addToCart);

// PATCH /cart/:productId - Update quantity of product in cart
router.patch("/:productId", updateCartQuantity);

// DELETE /cart/:productId - Remove product from cart
router.delete("/:productId", removeFromCart);

export default router;
