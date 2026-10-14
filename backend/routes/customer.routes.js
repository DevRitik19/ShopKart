import express from "express";

import {
    registerCustomer,
    loginCustomer,
    getCustomer,
    logoutCustomer,
    changePassword,
} from "../controllers/customer.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

router.get("/me", authMiddleware, getCustomer);

router.post("/logout", authMiddleware, logoutCustomer);

// Bonus: PATCH /customers/change-password
router.patch("/change-password", authMiddleware, changePassword);

export default router;