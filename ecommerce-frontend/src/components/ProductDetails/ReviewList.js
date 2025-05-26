import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./ReviewList.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products/${productId}/reviews`)
      .then((res) => res.json())
      .then((data) => setReviews(data))
      .catch((err) => {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  return (
    <motion.section
      className="reviews-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <h4 className="reviews-title">Customer Reviews</h4>

      {isLoading ? (
        // skeleton placeholders
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="review-card skeleton-card">
            <div className="skeleton skeleton-text skeleton-short"></div>
            <div className="skeleton skeleton-text skeleton-medium"></div>
            <div className="skeleton skeleton-text skeleton-short"></div>
            <div className="skeleton skeleton-text skeleton-long"></div>
            <div className="skeleton skeleton-text skeleton-long"></div>
          </div>
        ))
      ) : reviews.length === 0 ? (
        <p className="no-reviews">No reviews yet. Be the first to review!</p>
      ) : (
        reviews.map((rev) => (
          <div key={rev.id} className="review-card">
            <p className="review-user">{rev.user?.name || "Anonymous"}</p>
            <p className="review-date">
              {new Date(rev.created_at).toLocaleString()}
            </p>
            <p className="review-rating">
              {"⭐".repeat(rev.rating)}
              {"☆".repeat(5 - rev.rating)}
            </p>
            <p className="review-text">{rev.review_text}</p>
          </div>
        ))
      )}
    </motion.section>
  );
}
