import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import "./Checkout.css";

// Helper function to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, cartCount, clearCart, loading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect to cart if cart is empty after initial load
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartLoading, cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Client-side form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, "");
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (cleanPhone.length !== 10) {
      errors.phone = "Phone number must be a valid 10-digit number";
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Address line is required";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required";
    }

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(cleanPincode)) {
      errors.pincode = "Pincode must contain 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Complete Payment Verification
  const verifyAndFinalizePayment = async (verificationPayload) => {
    try {
      const verifyRes = await api.post("/orders/verify-payment", verificationPayload);
      if (verifyRes.data && verifyRes.data.success) {
        clearCart();
        const orderId = verifyRes.data.order._id;
        navigate(`/order-success/${orderId}`);
      } else {
        setErrorMessage(verifyRes.data?.message || "Payment verification failed.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setErrorMessage(
        err.response?.data?.message ||
          "Payment verification failed. Your cart has been preserved."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Open Official Razorpay Standard Checkout Popup
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      setErrorMessage("Please correct the errors in the shipping form.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create ShopKart order and Razorpay order on backend
      const response = await api.post("/orders/create-payment-order", {
        shippingAddress: formData,
      });

      if (!response.data || !response.data.success) {
        setErrorMessage(response.data?.message || "Failed to initiate payment");
        setSubmitting(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = response.data;

      // 2. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || !window.Razorpay) {
        setErrorMessage("Unable to load Razorpay SDK. Please check your internet connection.");
        setSubmitting(false);
        return;
      }

      // 3. Open Official Razorpay Checkout Modal
      const options = {
        key: key,
        amount: amount,
        currency: currency || "INR",
        name: "ShopKart",
        description: `Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          await verifyAndFinalizePayment({
            shopKartOrderId,
            razorpay_order_id: paymentResponse.razorpay_order_id || razorpayOrderId,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          });
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          method: "netbanking", // Opens Netbanking directly: NO CARD DETAILS NEEDED!
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setErrorMessage("Payment was cancelled. Your cart items are preserved.");
          },
        },
      };

      const rzpPayment = new window.Razorpay(options);

      rzpPayment.on("payment.failed", function (failResponse) {
        console.error("Razorpay payment failed:", failResponse.error);
        setErrorMessage(
          failResponse.error?.description ||
            "Payment failed. Your cart has not been cleared."
        );
        setSubmitting(false);
      });

      rzpPayment.open();
    } catch (err) {
      console.error("Checkout submission error:", err);
      setErrorMessage(
        err.response?.data?.message || "Unable to place order. Please try again."
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h1 className="checkout-title">Checkout</h1>
        <Link to="/cart" className="back-to-cart-link">
          &larr; Return to Cart
        </Link>
      </div>

      {errorMessage && (
        <div className="checkout-error-banner" role="alert">
          <strong>&#9888; Note:</strong> {errorMessage}
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Column: Shipping Form */}
        <div className="checkout-form-section">
          <form onSubmit={handlePlaceOrder} className="shipping-form" noValidate>
            <h2 className="section-title">Shipping Details</h2>

            <div className="form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="e.g. Aarav Sharma"
                value={formData.fullName}
                onChange={handleChange}
                className={formErrors.fullName ? "input-error" : ""}
                disabled={submitting}
              />
              {formErrors.fullName && (
                <span className="field-error-text">{formErrors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                maxLength={10}
                className={formErrors.phone ? "input-error" : ""}
                disabled={submitting}
              />
              {formErrors.phone && (
                <span className="field-error-text">{formErrors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="addressLine1">Address Line *</label>
              <input
                type="text"
                id="addressLine1"
                name="addressLine1"
                placeholder="House / Flat No., Street, Landmark"
                value={formData.addressLine1}
                onChange={handleChange}
                className={formErrors.addressLine1 ? "input-error" : ""}
                disabled={submitting}
              />
              {formErrors.addressLine1 && (
                <span className="field-error-text">{formErrors.addressLine1}</span>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={handleChange}
                  className={formErrors.city ? "input-error" : ""}
                  disabled={submitting}
                />
                {formErrors.city && (
                  <span className="field-error-text">{formErrors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={handleChange}
                  className={formErrors.state ? "input-error" : ""}
                  disabled={submitting}
                />
                {formErrors.state && (
                  <span className="field-error-text">{formErrors.state}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pincode">Pincode *</label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                placeholder="6-digit postal code"
                value={formData.pincode}
                onChange={handleChange}
                maxLength={6}
                className={formErrors.pincode ? "input-error" : ""}
                disabled={submitting}
              />
              {formErrors.pincode && (
                <span className="field-error-text">{formErrors.pincode}</span>
              )}
            </div>

            <div className="payment-method-box">
              <div className="payment-badge">
                <span className="radio-dot"></span>
                <strong>Razorpay Secure Checkout (Test Mode)</strong>
              </div>
              <p className="payment-desc">
                Supports UPI, Credit/Debit Cards, NetBanking, and Wallets in Test Mode.
              </p>
            </div>

            <button
              type="submit"
              className="place-order-submit-btn"
              disabled={submitting}
              id="place-order-btn"
            >
              {submitting ? "⏳ Opening Razorpay..." : `Pay ₹${subtotal.toLocaleString("en-IN")} with Razorpay`}
            </button>

            <div className="netbanking-test-instruction">
              <span className="tip-icon">💡</span>
              <span>
                <strong>Fastest 1-Click Test:</strong> Razorpay opens on <strong>Netbanking</strong>. Click any bank (<strong>SBI / HDFC</strong>) and click <strong>Success</strong> — the genuine Razorpay animation will play and complete your payment without card details!
              </span>
            </div>
          </form>
        </div>

        {/* Right Column: Order Summary Review */}
        <aside className="checkout-summary-section">
          <div className="checkout-summary-card">
            <h2 className="summary-title">Order Review</h2>

            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div className="checkout-item-row" key={item.product?._id}>
                  <div className="item-thumbnail">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/80x80?text=ShopKart";
                      }}
                    />
                  </div>
                  <div className="item-details">
                    <p className="item-name">{item.product?.name}</p>
                    <p className="item-qty-price">
                      Qty: {item.quantity} &times; ₹{Number(item.product?.price).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="item-subtotal">
                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
              ))}
            </div>

            <hr className="summary-divider" />

            <div className="summary-line">
              <span>Items Total ({cartCount} units)</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-line">
              <span>Delivery Charges</span>
              <span className="text-free">FREE</span>
            </div>

            <hr className="summary-divider" />

            <div className="summary-line total-line">
              <span>Total Payable</span>
              <span className="total-amount">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="security-notice">
              <span>&#128274;</span> 100% Verified &amp; Encrypted Payment
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
