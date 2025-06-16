import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./TrendingProducts.css";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";
const BASEURL = API.replace("/api", "");

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products/trending`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.section
      className="trending-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: "250px" }}
    >
      <h2 className="trending-title">🔥 Trending Products</h2>

      <div className="trending-carousel">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="trending-card skeleton-card">
                <div className="skeleton skeleton-badge"></div>
                <div className="skeleton skeleton-image"></div>
                <div className="skeleton skeleton-text skeleton-name"></div>
                <div className="skeleton skeleton-text skeleton-price"></div>
              </div>
            ))
          : products.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="trending-card"
              >
                <div className="hot-deal-badge">Hot Deal</div>
                <img
                  src={`${BASEURL}/storage/${p.image_url}`}
                  alt={p.name}
                  className="trending-image fade-image"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <h3 className="trending-name">{p.name}</h3>
                <p className="trending-price">Ksh {p.price}</p>
              </Link>
            ))}
      </div>

      {!isLoading && products.length > 0 && (
        <div className="trending-view-more">
          <Link to="/products" className="btn btn-outline-terra">
            View More Products
          </Link>
        </div>
      )}
    </motion.section>
  );
}
