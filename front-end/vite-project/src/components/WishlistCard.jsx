import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./WishlistCard.css";

const WishlistCard = ({ product, onRemove }) => {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(product._id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="wishlist-card">
      <div className="wishlist-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="wishlist-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x300?text=ShopKart";
          }}
        />
        <span className="wishlist-category-badge">{product.category}</span>
      </div>

      <div className="wishlist-info">
        <h3 className="wishlist-product-name">{product.name}</h3>
        <p className="wishlist-price">₹{Number(product.price).toLocaleString("en-IN")}</p>

        <p className={`wishlist-stock ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
          {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
        </p>

        <div className="wishlist-card-actions">
          <Link
            to={`/products/${product._id}`}
            className="wishlist-btn-view"
            id={`view-details-${product._id}`}
          >
            View Details
          </Link>

          <button
            onClick={handleRemove}
            disabled={removing}
            className="wishlist-btn-remove"
            id={`remove-wishlist-${product._id}`}
            title="Remove from Wishlist"
          >
            {removing ? (
              <>
                <span className="spinner-mini"></span> Removing...
              </>
            ) : (
              <>Remove &hearts;</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
