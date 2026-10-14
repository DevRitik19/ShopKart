import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All order endpoints are protected
router.use(authMiddleware);

// POST /orders & POST /orders/create-payment-order - Validate cart, create pending ShopKart order and Razorpay order
router.post("/", createPaymentOrder);
router.post("/create-payment-order", createPaymentOrder);

// POST /orders/verify-payment - Verify Razorpay HMAC signature, mark paid/placed, clear cart
router.post("/verify-payment", verifyPayment);

// GET /orders - Get all orders of authenticated user
router.get("/", getMyOrders);

// GET /orders/:id - Get single order details with ownership check
router.get("/:id", getOrderById);

// PATCH /orders/:id/status - Bonus: Progression of order status
router.patch("/:id/status", updateOrderStatus);

export default router;
