import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Modal,
  Button,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { AuthContext } from "../../contexts/AuthContext";
import "./FeaturedProducts.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState([]);
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [wishlistLoadingId, setWishlistLoadingId] = useState(null);
  const [cartLoadingId, setCartLoadingId] = useState(null);

  useEffect(() => {
    fetch(`${API}/products?featured=true`)
      .then((res) => res.json())
      .then((data) => setProducts(data.slice(0, 8)))
      .catch((err) => {
        console.error("Error fetching featured products:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    const fetchWishlist = () => {
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

    fetchWishlist();

    const onWishlistUpdated = () => fetchWishlist();
    window.addEventListener("wishlistUpdated", onWishlistUpdated);
    return () =>
      window.removeEventListener("wishlistUpdated", onWishlistUpdated);
  }, [isAuthenticated]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    if (product.stock_quantity <= 0) {
      setSelectedProduct(product);
      setShowOutOfStockModal(true);
      return;
    }

    setCartLoadingId(product.id);

    fetch(`${API}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
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
      })
      .finally(() => {
        setCartLoadingId(null);
      });
  };

  const handleAddToWishlist = (id) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    setWishlistLoadingId(id);

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
        toast.error("Item already in wishlist");
      })
      .finally(() => {
        setWishlistLoadingId(null);
      });
  };

  return (
    <motion.section
      className="featured-products-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: "300px" }}
    >
      <h2 className="featured-title ">Featured Products</h2>

      <Container>
        <Row className="g-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4} lg={3}>
                  <div className="skeleton skeleton-card rounded-4 shadow-soft" />
                </Col>
              ))
            : products.map((product) => {
                const inWishlist = wishlistIds.includes(product.id);
                const isSold = product.stock_quantity <= 0;
                return (
                  <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card className="featured-card featured-card--bold rounded-4 shadow-soft position-relative h-100 border-0">
                      {isSold && <div className="sold-badge">SOLD</div>}

                      {/* Media + hover overlay */}
                      <div className="product-media">
                        <Card.Img
                          src={product.image_url}
                          alt={product.name}
                          className="featured-image"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="media-mask" aria-hidden="true" />
                      </div>

                      {/* Body */}
                      <Card.Body className="d-flex flex-column p-3">
                        <Card.Title className="featured-product-name mb-1">
                          {product.name}
                        </Card.Title>
                        <div className="featured-price">
                          Ksh {product.price}
                        </div>

                        {/* Primary Add to Cart (big + visible) */}
                        <button
                          className="btn btn-add-to-cart mt-3"
                          onClick={() => handleAddToCart(product)}
                          disabled={isSold || cartLoadingId === product.id}
                          style={
                            isSold || cartLoadingId === product.id
                              ? { opacity: 0.6, cursor: "not-allowed" }
                              : {}
                          }
                          aria-label="Add to cart"
                          title="Add to cart"
                        >
                          {cartLoadingId === product.id ? (
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            />
                          ) : (
                            "🛒"
                          )}
                          {isSold ? "Out of stock" : "Add to cart"}
                        </button>

                        {/* Secondary row */}
                        <div className="mt-2 d-flex justify-content-between align-items-center">
                          <Link
                            to={`/products/${product.id}`}
                            className="btn btn-view-more btn-product-ghost"
                          >
                            View details
                          </Link>

                          <button
                            className="btn btn-wishlist-inline"
                            onClick={() =>
                              !inWishlist && handleAddToWishlist(product.id)
                            }
                            disabled={
                              inWishlist || wishlistLoadingId === product.id
                            }
                            aria-label={
                              inWishlist ? "In wishlist" : "Add to wishlist"
                            }
                            title={
                              inWishlist ? "In wishlist" : "Add to wishlist"
                            }
                          >
                            {wishlistLoadingId === product.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                                aria-hidden="true"
                              />
                            ) : (
                              "❤"
                            )}
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
        </Row>

        {!loading && products.length > 0 && (
          <div className="text-center featured-view-all">
            <Link to="/products" className="btn btn-view-all btn-contrast mt-4">
              View All Products
            </Link>
          </div>
        )}
      </Container>

      <Modal
        show={showOutOfStockModal}
        onHide={() => setShowOutOfStockModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Out of Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Sorry, <strong>{selectedProduct?.name}</strong> is currently out of
          stock.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOutOfStockModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.section>
  );
}
