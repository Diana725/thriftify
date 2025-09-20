import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./TrendingProducts.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

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
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y]}
        className="trending-swiper rounded-4 shadow-soft glass-lite"
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        loop={products.length > 4} // loop only if enough slides
        slidesPerView={1.2} // nice “peek” on mobile
        spaceBetween={12}
        breakpoints={{
          576: { slidesPerView: 2.2, spaceBetween: 14 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          992: { slidesPerView: 4, spaceBetween: 18 },
          1200: { slidesPerView: 5, spaceBetween: 20 },
        }}
        a11y={{ prevSlideMessage: "Previous", nextSlideMessage: "Next" }}
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <SwiperSlide key={`skeleton-${i}`}>
                <div className="trending-card skeleton-card">
                  <div className="skeleton skeleton-image" />
                  <div className="skeleton skeleton-text skeleton-name" />
                  <div className="skeleton skeleton-text skeleton-price" />
                </div>
              </SwiperSlide>
            ))
          : products.map((p) => (
              <SwiperSlide key={p.id}>
                <Link to={`/products/${p.id}`} className="trending-card">
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
              </SwiperSlide>
            ))}
      </Swiper>

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
