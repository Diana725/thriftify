import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./TrendingProducts.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const trackRef = useRef(null);
  const scroll = (dir) =>
    trackRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });

  useEffect(() => {
    fetch(`${API}/products/trending`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <motion.section
      className="trending-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: 250 }}
    >
      <h2 className="trending-title">Trending Products</h2>

      {/* Wrapper shares the same “glass-lite + shadow-soft + rounded-4” design language as Categories */}
      <div
        className="trending-carousel rounded-4 shadow-soft glass-lite"
        ref={trackRef}
      >
        {/* edge fades for visibility hint */}
        <div className="edge-fade left" aria-hidden="true" />
        <div className="edge-fade right" aria-hidden="true" />

        {/* clearly visible nav buttons (identical style tokens to Categories) */}
        <button
          type="button"
          className="trend-btn left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>
        <button
          type="button"
          className="trend-btn right"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="trending-card skeleton-card">
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-image" />
                <div className="skeleton skeleton-text skeleton-name" />
                <div className="skeleton skeleton-text skeleton-price" />
              </div>
            ))
          : products.map((p) => (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="trending-card"
              >
                <div className="trending-media">
                  <span className="hot-deal-badge">Hot Deal</span>
                  <img
                    src={p.image_url || "/images/placeholder.png"}
                    alt={p.name}
                    className="trending-image"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="media-mask" aria-hidden="true" />
                </div>

                <div className="trending-meta">
                  <h3 className="trending-name">{p.name}</h3>
                  <p className="trending-price">Ksh {p.price}</p>
                </div>
              </Link>
            ))}
      </div>

      {!isLoading && products.length > 0 && (
        <div className="trending-view-more">
          <Link to="/products" className="btn btn-contrast">
            View More Products
          </Link>
        </div>
      )}
    </motion.section>
  );
}
