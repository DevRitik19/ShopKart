import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart2026",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret_shopkart2026",
});

export default razorpay;
