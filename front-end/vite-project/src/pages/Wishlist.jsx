import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import WishlistCard from "../components/WishlistCard";
import "./Wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/wishlist");
      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist || []);
      } else {
        setError("We couldn't load your wishlist.");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      if (err.response && err.response.status === 401) {
        // Redirect to login if unauthenticated
        navigate("/login");
        return;
      }
      setError("We couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      setActionMessage(null);
      const response = await api.delete(`/wishlist/${productId}`);
      if (response.data && response.data.success) {
        // Optimistically update list
        setWishlist((prev) => prev.filter((item) => item._id !== productId));
        // Notify other components (Navbar count)
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
        setActionMessage({ type: "success", text: "Product removed from wishlist" });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error("Failed to remove product from wishlist:", err);
      setActionMessage({
        type: "error",
        text: err.response?.data?.message || "Unable to remove product. Please try again.",
      });
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        <div className="wishlist-loading-container">
          <div className="wishlist-spinner"></div>
          <p className="loading-text">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-state-card error-card">
          <div className="state-icon error-icon">&#9888;</div>
          <h2>Something went wrong.</h2>
          <p>{error}</p>
          <button onClick={fetchWishlist} className="btn-retry" id="retry-wishlist-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-state-card empty-card">
          <div className="state-icon heart-icon">&hearts;</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn-browse" id="browse-products-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // 4. Populated Wishlist State
  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <div className="wishlist-header-text">
          <h1>My Wishlist</h1>
          <p className="wishlist-count-text">
            {wishlist.length} {wishlist.length === 1 ? "product" : "products"} saved
          </p>
        </div>
        <Link to="/products" className="continue-shopping-link">
          &larr; Continue Shopping
        </Link>
      </div>

      {actionMessage && (
        <div className={`wishlist-toast ${actionMessage.type}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="wishlist-grid">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
