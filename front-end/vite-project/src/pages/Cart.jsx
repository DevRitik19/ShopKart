import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    itemActionLoading,
    cartCount,
    subtotal,
    itemCount,
    fetchCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (type, text) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateQuantity = async (productId, nextQty) => {
    const result = await updateQuantity(productId, nextQty);
    if (!result.success) {
      showToast("error", result.message);
    }
  };

  const handleRemove = async (productId) => {
    const result = await removeFromCart(productId);
    if (result.success) {
      showToast("success", "Item removed from cart");
    } else {
      showToast("error", result.message);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading-container">
          <div className="cart-spinner"></div>
          <p className="loading-text">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-state-card error-card">
          <div className="state-icon error-icon">&#9888;</div>
          <h2>Unable to load your cart.</h2>
          <p>{error}</p>
          <button onClick={fetchCart} className="btn-retry" id="retry-cart-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-state-card empty-card">
          <div className="state-icon cart-empty-icon">&#128722;</div>
          <h2>Your cart is empty &#128722;</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-browse" id="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 4. Populated Cart State
  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1 className="cart-title">My Cart</h1>
          <p className="cart-subtitle">
            {itemCount} {itemCount === 1 ? "item" : "items"} ({cartCount} total units)
          </p>
        </div>
        <Link to="/products" className="continue-shopping-link">
          &larr; Continue Shopping
        </Link>
      </div>

      {toastMessage && (
        <div className={`cart-toast ${toastMessage.type}`} role="alert">
          {toastMessage.text}
        </div>
      )}

      <div className="cart-layout">
        {/* Left column: Cart Items list */}
        <div className="cart-items-section">
          {cartItems.map((item) => (
            <CartItem
              key={item.product?._id || item._id}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
              isItemLoading={!!itemActionLoading[item.product?._id]}
            />
          ))}
        </div>

        {/* Right column: Order Summary Card */}
        <aside className="order-summary-card">
          <h2 className="summary-title">Order Summary</h2>

          <div className="summary-row">
            <span className="summary-label">Items ({cartCount} units)</span>
            <span className="summary-value">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="summary-row">
            <span className="summary-label">Estimated Delivery</span>
            <span className="summary-value text-free">FREE</span>
          </div>

          <hr className="summary-divider" />

          <div className="summary-row total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-price" id="cart-subtotal-price">
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            type="button"
            className="checkout-btn"
            id="proceed-checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout &rarr;
          </button>

          <p className="secure-badge">
            <span className="badge-icon">&#128274;</span> Secure 256-bit SSL Checkout
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
