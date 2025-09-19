import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Categories.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CategoryCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    fetch(`${API}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.offsetWidth * 0.7;
    track.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Extract current active category ID from URL
  const activePath = location.pathname;
  const activeCategoryId = activePath.startsWith("/products/category/")
    ? activePath.split("/products/category/")[1]
    : null;
  const isAllActive = activePath === "/products";

  return (
    <motion.section
      className="category-carousel-container fade-section trending-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: "150px" }}
    >
      <h3 className="section-title fs-2 fw-bold mb-2">Shop by Category</h3>
      <p className="section-subtitle">Find your next thrift gem fast.</p>

      <div className="carousel-wrapper rounded-4 shadow-soft glass-lite">
        {/* edge fades for elegance */}
        <div className="edge-fade left" aria-hidden="true" />
        <div className="edge-fade right" aria-hidden="true" />

        <button
          className="carousel-btn left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div className="carousel-track" ref={trackRef}>
          {/* All Category */}
          <Link
            to="/products"
            className={`category-card category-text-only category-chip ${
              isAllActive ? "active" : ""
            }`}
          >
            <div className="category-name">
              <span className="category-label">ALL</span>
            </div>
          </Link>

          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="category-card category-chip">
                  <div className="skeleton skeleton-text" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products/category/${cat.id}`}
                  className={`category-card category-text-only category-chip ${
                    activeCategoryId === String(cat.id) ? "active" : ""
                  }`}
                >
                  <div className="category-name">
                    <span className="category-label">
                      {cat.name.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))}
        </div>

        <button
          className="carousel-btn right"
          onClick={() => scroll("right")}
          aria-label="Scroll right"
        >
          <FaChevronRight />
        </button>
      </div>
    </motion.section>
  );
}
