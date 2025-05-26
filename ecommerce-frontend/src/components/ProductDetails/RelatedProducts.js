import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Row, Col } from "react-bootstrap";
import "./RelatedProducts.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
// const BASEURL = API.replace("/api", "");

// scroll-triggered fade-in variant
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function RelatedProducts({ productId }) {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products/${productId}/related`)
      .then((res) => res.json())
      .then((data) => setRelatedProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching related products:", err);
        setRelatedProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [productId]);

  // If loaded and no related items, don't render section
  if (!isLoading && relatedProducts.length === 0) return null;

  return (
    <motion.section
      className="related-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <Container>
        <h3 className="related-title">Related Products</h3>
        <Row className="g-4">
          {isLoading
            ? // 4 skeleton cards
              Array.from({ length: 4 }).map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4} lg={3}>
                  <div className="skeleton-card">
                    <div className="skeleton skeleton-image"></div>
                    <div className="skeleton skeleton-text skeleton-title"></div>
                    <div className="skeleton skeleton-text skeleton-price"></div>
                    <div className="skeleton skeleton-button"></div>
                  </div>
                </Col>
              ))
            : // real related products
              relatedProducts.map((prod) => (
                <Col key={prod.id} xs={12} sm={6} md={4} lg={3}>
                  <div className="related-card">
                    <div className="related-img-wrapper">
                      <img
                        loading="lazy"
                        src={prod.image_url}
                        alt={prod.name}
                        className="related-image fade-image"
                        onLoad={(e) => e.currentTarget.classList.add("loaded")}
                      />
                    </div>
                    <div className="related-body">
                      <h4 className="related-name">{prod.name}</h4>
                      <p className="related-price">Ksh {prod.price}</p>
                      <Link
                        to={`/products/${prod.id}`}
                        className="btn btn-view-more btn-sm"
                      >
                        View More
                      </Link>
                    </div>
                  </div>
                </Col>
              ))}
        </Row>
      </Container>
    </motion.section>
  );
}
