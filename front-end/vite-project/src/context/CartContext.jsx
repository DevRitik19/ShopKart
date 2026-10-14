import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itemActionLoading, setItemActionLoading] = useState({});

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/cart");
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // User not logged in
        setCartItems([]);
      } else {
        console.error("Error loading cart:", err);
        setError("Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Set action loading for an individual product
  const setItemLoading = (productId, isLoading) => {
    setItemActionLoading((prev) => ({
      ...prev,
      [productId]: isLoading,
    }));
  };

  // Add product to cart (or increment if already exists)
  const addToCart = async (productId) => {
    setItemLoading(productId, true);
    try {
      const response = await api.post(`/cart/${productId}`);
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: response.data.message || "Added to cart" };
      }
      return { success: false, message: "Failed to add to cart" };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Please login to add items to cart"
          : "Unable to add product to cart");
      return { success: false, message, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Update quantity of a product
  const updateQuantity = async (productId, quantity) => {
    setItemLoading(productId, true);
    try {
      const response = await api.patch(`/cart/${productId}`, { quantity });
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: "Quantity updated" };
      }
      return { success: false, message: "Failed to update quantity" };
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to update quantity";
      return { success: false, message, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Remove a product from cart
  const removeFromCart = async (productId) => {
    setItemLoading(productId, true);
    try {
      const response = await api.delete(`/cart/${productId}`);
      if (response.data && response.data.success) {
        setCartItems(response.data.cart || []);
        return { success: true, message: "Product removed from cart" };
      }
      return { success: false, message: "Failed to remove product" };
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to remove product from cart";
      return { success: false, message, status: err.response?.status };
    } finally {
      setItemLoading(productId, false);
    }
  };

  // Clear cart state (e.g. on logout)
  const clearCart = () => {
    setCartItems([]);
  };

  // Derived values
  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [cartItems]);

  const itemCount = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  const getItemQuantity = useCallback(
    (productId) => {
      const item = cartItems.find((it) => it.product?._id === productId);
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  const value = {
    cartItems,
    loading,
    error,
    itemActionLoading,
    cartCount,
    subtotal,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
