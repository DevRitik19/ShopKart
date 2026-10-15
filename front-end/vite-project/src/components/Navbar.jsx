import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(0);
  const { cartCount, clearCart, fetchCart } = useCart();

  const fetchWishlistCount = async () => {
    try {
      const response = await api.get("/wishlist");
      if (response.data && response.data.success) {
        setWishlistCount(response.data.count ?? (response.data.wishlist?.length || 0));
      }
    } catch {
      // If unauthorized, count is 0
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdated = () => {
      fetchWishlistCount();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      setWishlistCount(0);
      clearCart();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("shopkart-theme");
    if (saved) return saved === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("shopkart-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("shopkart-theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">
        ShopKart
      </Link>

      <div className="nav-links">
        <Link
          to="/home"
          className={`nav-link ${location.pathname === "/home" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/products"
          className={`nav-link ${location.pathname === "/products" ? "active" : ""}`}
        >
          Products
        </Link>
        <Link
          to="/wishlist"
          className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""}`}
          id="nav-wishlist-link"
        >
          Wishlist {wishlistCount > 0 && <span className="wishlist-badge">({wishlistCount})</span>}
        </Link>
        <Link
          to="/cart"
          className={`nav-link ${location.pathname === "/cart" ? "active" : ""}`}
          id="nav-cart-link"
        >
          Cart <span className="cart-badge">({cartCount})</span>
        </Link>
        <Link
          to="/orders"
          className={`nav-link ${location.pathname.startsWith("/orders") ? "active" : ""}`}
          id="nav-orders-link"
        >
          Orders
        </Link>
      </div>

      <div className="nav-actions">
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Night Mode"}
          aria-label="Toggle theme"
          id="theme-toggle-btn"
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {!isAuthRoute && (
          <button
            className="logout-button"
            onClick={handleLogout}
            id="logout-button"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;