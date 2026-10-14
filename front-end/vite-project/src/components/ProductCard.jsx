import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./ProductCard.css";

const ProductCard = ({ product, initialWishlisted = false, onWishlistChange }) => {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [cartSuccessMessage, setCartSuccessMessage] = useState("");

  const { addToCart, getItemQuantity, itemActionLoading } = useCart();
  const isAddingToCart = !!itemActionLoading[product._id];
  const inCartQuantity = getItemQuantity(product._id);

  useEffect(() => {
    setWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (saving) return; // Prevent duplicate clicks while in-flight

    setSaving(true);
    setErrorMessage("");

    try {
      if (!wishlisted) {
        // Step 1: Add to wishlist via POST /wishlist/:productId
        const response = await api.post(`/wishlist/${product._id}`);
        if (response.data && response.data.success) {
          setWishlisted(true);
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
          if (onWishlistChange) onWishlistChange(product._id, true);
        }
      } else {
        // Step 2: Remove from wishlist via DELETE /wishlist/:productId (Bonus toggle)
        const response = await api.delete(`/wishlist/${product._id}`);
        if (response.data && response.data.success) {
          setWishlisted(false);
          window.dispatchEvent(new CustomEvent("wishlistUpdated"));
          if (onWishlistChange) onWishlistChange(product._id, false);
        }
      }
    } catch (err) {
      console.error("Wishlist action error:", err);
      if (err.response?.status === 409) {
        // Already in wishlist
        setWishlisted(true);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else if (err.response?.status === 401) {
        setErrorMessage("Please login to manage wishlist.");
      } else {
        setErrorMessage(
          err.response?.data?.message || "Unable to save product. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    if (isAddingToCart || product.stock <= 0) return;

    setErrorMessage("");
    setCartSuccessMessage("");

    const result = await addToCart(product._id);
    if (result.success) {
      setCartSuccessMessage("Added to cart!");
      setTimeout(() => setCartSuccessMessage(""), 2500);
    } else {
      setErrorMessage(result.message);
    }
  };

  // Wishlist button text depending on state
  const getWishlistButtonContent = () => {
    if (saving) {
      return (
        <>
          <span className="btn-spinner"></span> ⏳ Saving...
        </>
      );
    }
    if (wishlisted) {
      return <>&#9829; Wishlisted</>;
    }
    return <>&#9825; Wishlist</>;
  };

  // Add to cart button content depending on state
  const getCartButtonContent = () => {
    if (isAddingToCart) {
      return (
        <>
          <span className="btn-spinner"></span> Adding...
        </>
      );
    }
    if (product.stock <= 0) {
      return "Out of Stock";
    }
    if (inCartQuantity >= product.stock) {
      return "Max in Cart";
    }
    if (inCartQuantity > 0) {
      return `Add Another (+1)`;
    }
    return "Add to Cart";
  };

  return (
    <div className="product-card" id={`product-card-${product._id}`}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x300?text=ShopKart";
          }}
        />

        {/* Floating Heart Icon */}
        <button
          className={`floating-wishlist-btn ${wishlisted ? "active" : ""}`}
          onClick={handleWishlistClick}
          disabled={saving}
          title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist heart"
          id={`floating-wishlist-${product._id}`}
        >
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">₹{Number(product.price).toLocaleString("en-IN")}</p>

        <p className={`product-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        {errorMessage && (
          <div className="product-card-error" role="alert">
            {errorMessage}
          </div>
        )}

        {cartSuccessMessage && (
          <div className="product-card-success" role="status">
            &#10003; {cartSuccessMessage}
          </div>
        )}

        <div className="product-card-actions-wrapper">
          {/* Add to Cart button */}
          <button
            type="button"
            className={`add-to-cart-action-btn ${inCartQuantity > 0 ? "has-in-cart" : ""}`}
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || product.stock <= 0 || inCartQuantity >= product.stock}
            id={`add-to-cart-${product._id}`}
          >
            {getCartButtonContent()}
          </button>

          <div className="product-card-secondary-buttons">
            <Link
              to={`/products/${product._id}`}
              className="view-details-btn"
              id={`view-details-${product._id}`}
            >
              Details
            </Link>

            <button
              type="button"
              className={`wishlist-action-btn ${wishlisted ? "wishlisted" : ""}`}
              onClick={handleWishlistClick}
              disabled={saving}
              id={`wishlist-btn-${product._id}`}
            >
              {getWishlistButtonContent()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
