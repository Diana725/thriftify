import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import "./FeaturedProducts.css";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);

  // fetch featured products
  useEffect(() => {
    fetch(`${API}/products?featured=true`)
      .then((res) => res.json())
      .then((data) => setProducts(data.slice(0, 8)))
      .catch((err) => {
        console.error("Error fetching featured products:", err);
        setProducts([]);
      });
  }, []);

  // fetch user's wishlist IDs whenever they log in or the component mounts
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    fetch(`${API}/wishlist`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // data is array of wishlist objects, e.g. { id, product_id, ... }
        const ids = Array.isArray(data) ? data.map((w) => w.product_id) : [];
        setWishlistIds(ids);
      })
      .catch((err) => console.error("Error fetching wishlist:", err));

    // also refresh when wishlistUpdated event fires
    const onWishlistUpdated = () => {
      // re-run the fetch
      fetch(`${API}/wishlist`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          const ids = Array.isArray(data) ? data.map((w) => w.product_id) : [];
          setWishlistIds(ids);
        })
        .catch((err) => console.error("Error fetching wishlist:", err));
    };
    window.addEventListener("wishlistUpdated", onWishlistUpdated);
    return () =>
      window.removeEventListener("wishlistUpdated", onWishlistUpdated);
  }, [isAuthenticated]);

  const handleAddToCart = (id) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    fetch(`${API}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ product_id: id, quantity: 1 }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.json();
      })
      .then(() => {
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Item added to cart!");
      })
      .catch((err) => {
        console.error("Add to cart failed:", err);
        toast.error("Failed to add to cart");
      });
  };

  const handleAddToWishlist = (id) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    fetch(`${API}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ product_id: id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not OK");
        return res.json();
      })
      .then(() => {
        window.dispatchEvent(new Event("wishlistUpdated"));
        toast.success("Item added to wishlist!");
      })
      .catch((err) => {
        console.error("Add to wishlist failed:", err);
        toast.error("Failed to add to wishlist");
      });
  };

  return (
    <motion.section
      className="featured-products-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="featured-title">Featured Products</h2>
      <Container>
        <Row className="g-4">
          {products === null
            ? Array.from({ length: 8 }).map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4} lg={3}>
                  {/* …your skeleton loader here… */}
                </Col>
              ))
            : products.map((product) => {
                const inWishlist = wishlistIds.includes(product.id);
                return (
                  <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="featured-card shadow-lg">
                      <div className="card-img-wrapper">
                        <Card.Img
                          loading="lazy"
                          variant="top"
                          src={product.image_url}
                          alt={product.name}
                          className="featured-image"
                        />
                      </div>
                      <Card.Body>
                        <Card.Title className="featured-product-name">
                          {product.name}
                        </Card.Title>
                        <div className="featured-price">
                          Ksh {product.price}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="btn btn-view-more btn-primary btn-sm"
                          >
                            View More
                          </Link>
                          <div>
                            {/* Disable the wishlist button if already in wishlist */}
                            <button
                              className="btn btn-wishlist btn-sm me-2"
                              onClick={() =>
                                !inWishlist && handleAddToWishlist(product.id)
                              }
                              disabled={inWishlist}
                              style={
                                inWishlist
                                  ? { opacity: 0.6, cursor: "not-allowed" }
                                  : {}
                              }
                            >
                              ❤️
                            </button>

                            {/* Cart button stays as-is */}
                            <button
                              className="btn btn-cart btn-sm"
                              onClick={() => handleAddToCart(product.id)}
                            >
                              🛒
                            </button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
        </Row>

        {products !== null && (
          <div className="text-center featured-view-all">
            <Link
              to="/products"
              className="btn btn-view-all btn-outline-terra mt-4"
            >
              View All Products
            </Link>
          </div>
        )}
      </Container>
    </motion.section>
  );
}
