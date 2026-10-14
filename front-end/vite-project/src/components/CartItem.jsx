import React from "react";
import { Link } from "react-router-dom";
import "./CartItem.css";

const CartItem = ({ item, onUpdateQuantity, onRemove, isItemLoading }) => {
  const { product, quantity } = item;
  if (!product) return null;

  const isMaxStock = quantity >= product.stock;
  const isMinQuantity = quantity <= 1;

  const handleDecrease = () => {
    if (quantity > 1 && !isItemLoading) {
      onUpdateQuantity(product._id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock && !isItemLoading) {
      onUpdateQuantity(product._id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (!isItemLoading) {
      onRemove(product._id);
    }
  };

  const itemTotal = (product.price || 0) * quantity;

  return (
    <div className="cart-item-card" id={`cart-item-${product._id}`}>
      <div className="cart-item-image-wrapper">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/200x200?text=ShopKart";
            }}
          />
        </Link>
      </div>

      <div className="cart-item-details">
        <div className="cart-item-info">
          <Link to={`/products/${product._id}`} className="cart-item-title-link">
            <h3 className="cart-item-title">{product.name}</h3>
          </Link>
          <span className="cart-item-category">{product.category}</span>
          <p className="cart-item-unit-price">
            ₹{Number(product.price).toLocaleString("en-IN")} each
          </p>
          <p className={`cart-item-stock-status ${product.stock <= 3 ? "low-stock" : ""}`}>
            {product.stock > 0
              ? `${product.stock} units available`
              : "Out of stock"}
          </p>
        </div>

        <div className="cart-item-actions-row">
          {/* Quantity Controls */}
          <div className="quantity-controls" aria-label="Quantity controls">
            <button
              type="button"
              className="qty-btn qty-decrease"
              onClick={handleDecrease}
              disabled={isMinQuantity || isItemLoading}
              aria-label="Decrease quantity"
              id={`qty-decrease-${product._id}`}
            >
              &minus;
            </button>
            <span className="qty-value" id={`qty-value-${product._id}`}>
              {isItemLoading ? <span className="qty-spinner">...</span> : quantity}
            </span>
            <button
              type="button"
              className="qty-btn qty-increase"
              onClick={handleIncrease}
              disabled={isMaxStock || isItemLoading}
              aria-label="Increase quantity"
              id={`qty-increase-${product._id}`}
              title={isMaxStock ? "Max stock reached" : "Increase quantity"}
            >
              +
            </button>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={handleRemove}
            disabled={isItemLoading}
            id={`remove-cart-${product._id}`}
          >
            {isItemLoading ? "Removing..." : "Remove"}
          </button>
        </div>

        {isMaxStock && (
          <p className="stock-limit-note">Max available stock reached ({product.stock})</p>
        )}
      </div>

      <div className="cart-item-total-col">
        <span className="cart-item-total-label">Subtotal</span>
        <span className="cart-item-total-price">
          ₹{Number(itemTotal).toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
};

export default CartItem;
