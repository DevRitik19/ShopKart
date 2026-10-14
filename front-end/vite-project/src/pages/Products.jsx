import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("newest");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category !== "All") params.append("category", category);
      if (sort !== "newest") params.append("sort", sort);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  const [wishlistIds, setWishlistIds] = useState(new Set());

  const fetchWishlistStatus = async () => {
    try {
      const response = await api.get("/wishlist");
      if (response.data?.success && Array.isArray(response.data.wishlist)) {
        const ids = new Set(response.data.wishlist.map((item) => item._id));
        setWishlistIds(ids);
      }
    } catch {
      // Ignored if user is unauthenticated
    }
  };

  useEffect(() => {
    fetchWishlistStatus();

    const handleWishlistUpdated = () => {
      fetchWishlistStatus();
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
    };
  }, []);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <div className="products-page">
      <h1>Products</h1>
      
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Books">Books</option>
          <option value="Home">Home</option>
        </select>

        <select 
          value={sort} 
          onChange={(e) => setSort(e.target.value)}
          className="filter-select"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <div className="loading-state">Loading products...</div>}
      {error && <div className="error-state">{error}</div>}
      
      {!loading && !error && products.length === 0 && (
        <div className="empty-state">No products found.</div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              initialWishlisted={wishlistIds.has(product._id)}
              onWishlistChange={(productId, isSaved) => {
                setWishlistIds((prev) => {
                  const next = new Set(prev);
                  if (isSaved) next.add(productId);
                  else next.delete(productId);
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
