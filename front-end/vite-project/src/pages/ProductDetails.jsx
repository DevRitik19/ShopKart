import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";
import "./ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  const { addToCart, getItemQuantity, itemActionLoading } = useCart();
  const isAddingToCart = !!itemActionLoading[id];
  const inCartQty = getItemQuantity(id);

  useEffect(() => {
    const fetchProductAndWishlist = async () => {
      try {
        setLoading(true);
        const [productRes, wishlistRes] = await Promise.allSettled([
          api.get(`/products/${id}`),
          api.get("/wishlist"),
        ]);

        if (productRes.status === "fulfilled" && productRes.value.data.product) {
          setProduct(productRes.value.data.product);
        } else {
          setError("Product not found or failed to load.");
        }

        if (
          wishlistRes.status === "fulfilled" &&
          wishlistRes.value.data?.wishlist
        ) {
          const found = wishlistRes.value.data.wishlist.some(
            (item) => item._id === id
          );
          setIsWishlisted(found);
        }
      } catch (err) {
        console.error(err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndWishlist();
  }, [id]);

  const handleWishlistToggle = async () => {
    if (wishlistSaving) return;
    setWishlistSaving(true);
    setWishlistMessage("");

    try {
      if (!isWishlisted) {
        await api.post(`/wishlist/${id}`);
        setIsWishlisted(true);
        setWishlistMessage("Added to wishlist!");
      } else {
        await api.delete(`/wishlist/${id}`);
        setIsWishlisted(false);
        setWishlistMessage("Removed from wishlist.");
      }
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      setTimeout(() => setWishlistMessage(""), 3000);
    } catch (err) {
      console.error("Wishlist action error:", err);
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else if (err.response?.status === 401) {
        setWishlistMessage("Please log in to manage your wishlist.");
      } else {
        setWishlistMessage("Unable to update wishlist. Please try again.");
      }
      setTimeout(() => setWishlistMessage(""), 4000);
    } finally {
      setWishlistSaving(false);
    }
  };

  if (loading) return <div className="loading-state">Loading product details...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!product) return <div className="error-state">Product not found.</div>;

  return (
    <div className="product-details-page">
      <Link to="/products" className="back-link">&larr; Back to Products</Link>
      <div className="product-details-container">
        <div className="product-details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="product-details-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/500x500?text=ShopKart";
            }}
          />
        </div>
        <div className="product-details-info-section">
          <h1 className="product-details-name">{product.name}</h1>
          <p className="product-details-category">{product.category}</p>
          <p className="product-details-price">₹{Number(product.price).toLocaleString("en-IN")}</p>
          
          <div className="product-details-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          <p className="product-details-stock">
            {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
          </p>

          {wishlistMessage && (
            <div className="product-details-feedback" role="alert">
              {wishlistMessage}
            </div>
          )}

          {cartMessage && (
            <div className="product-details-feedback cart-feedback" role="alert">
              {cartMessage}
            </div>
          )}

          <div className="product-details-actions">
            <button 
              className="add-to-cart-btn" 
              disabled={product.stock <= 0 || isAddingToCart || inCartQty >= product.stock}
              onClick={async () => {
                setCartMessage("");
                const result = await addToCart(id);
                if (result.success) {
                  setCartMessage("Added to cart! 🛒");
                  setTimeout(() => setCartMessage(""), 3000);
                } else {
                  setCartMessage(result.message);
                  setTimeout(() => setCartMessage(""), 4000);
                }
              }}
              id="details-add-to-cart-btn"
            >
              {isAddingToCart ? (
                "⏳ Adding..."
              ) : product.stock <= 0 ? (
                "Out of Stock"
              ) : inCartQty >= product.stock ? (
                "Max in Cart"
              ) : inCartQty > 0 ? (
                `Add Another (${inCartQty} in cart)`
              ) : (
                "Add to Cart"
              )}
            </button>

            <button
              className={`details-wishlist-btn ${isWishlisted ? "wishlisted" : ""}`}
              onClick={handleWishlistToggle}
              disabled={wishlistSaving}
              id="details-wishlist-toggle"
            >
              {wishlistSaving ? (
                "⏳ Saving..."
              ) : isWishlisted ? (
                "♥ Saved in Wishlist"
              ) : (
                "♡ Add to Wishlist"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
