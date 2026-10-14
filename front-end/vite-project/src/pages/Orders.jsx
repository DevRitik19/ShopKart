import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/orders");
      if (response.data && response.data.success) {
        setOrders(response.data.orders || []);
      } else {
        setError("Unable to load orders");
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError("Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Bonus Challenge: Update order status progression
  const handleStatusChange = async (orderId, newStatus) => {
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      if (response.data && response.data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="orders-page">
        <h1 className="orders-page-title">My Orders</h1>
        <div className="orders-loading-box">
          <div className="orders-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="orders-page">
        <h1 className="orders-page-title">My Orders</h1>
        <div className="orders-state-card error-card">
          <div className="state-icon">&#9888;</div>
          <h2>Unable to load your orders.</h2>
          <p>{error}</p>
          <button onClick={fetchOrders} className="btn-retry" id="retry-orders-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <h1 className="orders-page-title">My Orders</h1>
        <div className="orders-state-card empty-card">
          <div className="state-icon">&#128230;</div>
          <h2>You have not placed any orders yet.</h2>
          <p>Browse our catalog, add your favorite items and check out today.</p>
          <Link to="/products" className="btn-browse" id="start-shopping-btn">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // 4. Populated Orders State
  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1 className="orders-page-title">My Orders</h1>
        <span className="orders-count-badge">
          {orders.length} {orders.length === 1 ? "order" : "orders"} placed
        </span>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div className="order-card" key={order._id} id={`order-card-${order._id}`}>
              <div className="order-card-header">
                <div className="order-card-header-left">
                  <span className="order-id-label">Order #{order._id}</span>
                  <span className="order-date-label">{dateStr}</span>
                </div>

                <div className="order-card-header-badges">
                  <span className={`badge-payment ${order.paymentStatus?.toLowerCase()}`}>
                    &#128179; {order.paymentStatus || "PAID"}
                  </span>
                  <span className={`badge-status status-${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="order-items-preview">
                {order.items?.map((item, idx) => (
                  <div className="order-item-chip" key={idx}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="chip-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/40x40?text=Item";
                        }}
                      />
                    )}
                    <span className="chip-name">{item.name}</span>
                    <span className="chip-qty">&times; {item.quantity}</span>
                    <span className="chip-price">
                      (₹{Number(item.price).toLocaleString("en-IN")})
                    </span>
                  </div>
                ))}
              </div>

              {/* Shipping address line */}
              {order.shippingAddress && (
                <div className="order-shipping-summary">
                  <span className="shipping-icon">&#128205;</span>
                  <span className="shipping-text">
                    Deliver to: <strong>{order.shippingAddress.fullName}</strong>,{" "}
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </span>
                </div>
              )}

              {/* Footer row with total and action */}
              <div className="order-card-footer">
                <div className="order-total-block">
                  <span className="footer-total-label">Total Amount</span>
                  <span className="footer-total-value">
                    ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="order-footer-actions">
                  {/* Bonus progression dropdown for testing */}
                  <div className="status-progression-control">
                    <label htmlFor={`status-select-${order._id}`}>
                      Status:
                    </label>
                    <select
                      id={`status-select-${order._id}`}
                      value={order.status}
                      disabled={statusUpdating[order._id]}
                      onChange={(e) =>
                        handleStatusChange(order._id, e.target.value)
                      }
                      className="status-dropdown"
                    >
                      <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                      <option value="PLACED">PLACED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>

                  <Link
                    to={`/order-success/${order._id}`}
                    className="view-order-details-btn"
                    id={`view-order-${order._id}`}
                  >
                    View Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
