import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/orders/${id}`);
        if (response.data && response.data.success) {
          setOrder(response.data.order);
        } else {
          setError("Order not found");
        }
      } catch (err) {
        console.error("Fetch order error:", err);
        setError("Unable to load order details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="success-loading-spinner"></div>
        <p>Loading order confirmation...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="order-card-wrapper error-wrapper">
          <h2>Order Details Unavailable</h2>
          <p>{error || "We couldn't locate this order."}</p>
          <Link to="/orders" className="btn-primary">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">
      <div className="order-card-wrapper">
        <div className="success-icon-badge">&#10004;</div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for your purchase. Your payment has been verified.
        </p>

        <div className="order-meta-grid">
          <div className="meta-box">
            <span className="meta-label">Order ID</span>
            <span className="meta-val code-val">#{order._id}</span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Payment Status</span>
            <span className="meta-val status-paid">
              {order.paymentStatus || "PAID"}
            </span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Order Status</span>
            <span className="meta-val status-placed">{order.status}</span>
          </div>

          <div className="meta-box">
            <span className="meta-label">Total Amount</span>
            <span className="meta-val price-val">
              ₹{Number(order.totalAmount).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Shipping Summary */}
        {order.shippingAddress && (
          <div className="success-shipping-info">
            <h3>Shipping Details</h3>
            <p className="shipping-recipient">
              <strong>{order.shippingAddress.fullName}</strong> &bull; {order.shippingAddress.phone}
            </p>
            <p className="shipping-address-line">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        )}

        {/* Items Summary */}
        <div className="success-items-section">
          <h3>Items in this Order ({order.items?.length || 0})</h3>
          <div className="success-items-list">
            {order.items?.map((item, idx) => (
              <div className="success-item-row" key={idx}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="item-row-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/60x60?text=Product";
                    }}
                  />
                )}
                <div className="item-row-text">
                  <span className="item-row-name">{item.name}</span>
                  <span className="item-row-qty">
                    Quantity: {item.quantity} &times; ₹{Number(item.price).toLocaleString("en-IN")}
                  </span>
                </div>
                <span className="item-row-total">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="success-actions-row">
          <Link to="/orders" className="btn-secondary" id="view-orders-btn">
            View My Orders
          </Link>
          <Link to="/products" className="btn-primary" id="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
