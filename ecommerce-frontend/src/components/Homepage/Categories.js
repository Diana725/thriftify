import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./Categories.css";

// Static imports
import coatsImg from "../../assets/pexels-bellazhong-3782786.jpg";
import topsImg from "../../assets/bags.jpg";
import dressesImg from "../../assets/others.jpg";
import gymWearImg from "../../assets/pexels-catscoming-1204464.jpg";
import denimImg from "../../assets/sport-running-shoes.jpg";
import defaultImg from "../../assets/watches.jpg";

const imageMap = {
  Coats: coatsImg,
  Tops: topsImg,
  Dresses: dressesImg,
  "Gym Wear": gymWearImg,
  Denim: denimImg,
};

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function CategoryCarousel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  // Preload images once at mount
  useEffect(() => {
    Object.values(imageMap).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

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

  return (
    <motion.section
      className="category-carousel-container fade-section trending-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: "200px" }}
    >
      <h3 className="section-title text-secondary">Shop by Category</h3>
      <div className="carousel-wrapper">
        <button
          className="carousel-btn left"
          onClick={() => scroll("left")}
          aria-label="Scroll left"
        >
          <FaChevronLeft />
        </button>

        <div className="carousel-track" ref={trackRef}>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="category-card">
                  <div className="skeleton skeleton-image" />
                  <div className="skeleton skeleton-text" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products/category/${cat.id}`}
                  className="category-card"
                >
                  <img
                    src={imageMap[cat.name] || defaultImg}
                    alt={cat.name}
                    className="category-image"
                  />
                  <div className="category-name">{cat.name}</div>
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
