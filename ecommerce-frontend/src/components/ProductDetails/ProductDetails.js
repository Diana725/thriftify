import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Modal, Button } from "react-bootstrap";
import AddToWishlistButton from "./AddToWishlistButton";
import ReviewList from "./ReviewList";
import RelatedProducts from "./RelatedProducts";
import "./ProductDetails.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../contexts/AuthContext";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    // Skeleton layout
    return (
      <Container className="product-details skeleton-container">
        <Row className="align-items-center">
          <Col md={6}>
            <div className="skeleton skeleton-image-large"></div>
          </Col>
          <Col md={6}>
            <div className="skeleton skeleton-text title"></div>
            <div className="skeleton skeleton-text price"></div>
            <div className="skeleton skeleton-text desc"></div>
            <div className="skeleton skeleton-text desc"></div>
            <div className="skeleton skeleton-text desc short"></div>
            <div className="d-flex gap-2 mt-3">
              <div className="skeleton skeleton-button"></div>
              <div className="skeleton skeleton-button small"></div>
            </div>
          </Col>
        </Row>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-4">
        <p>Product not found.</p>
      </Container>
    );
  }
  const avg = product.average_rating; // e.g. 4.2
  const fullStars = Math.floor(avg);
  const halfStar = avg - fullStars >= 0.5;
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    // out-of-stock guard
    if (product.stock_quantity <= 0) {
      setShowOutOfStockModal(true);
      return;
    }

    fetch(`${API}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    })
      .then((res) => res.json())
      .then(() => {
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Added to Cart!");
      })
      .catch(() => toast.error("Failed to add to Cart"));
  };

  return (
    <Container className="product-details py-4">
      <Row className="align-items-center">
        <Col md={6}>
          <img
            src={product.image_url}
            alt={product.name}
            className="img-fluid rounded shadow fade-image"
            loading="lazy"
            onLoad={(e) => e.currentTarget.classList.add("loaded")}
          />
        </Col>
        <Col md={6}>
          <h2 className="product-title">{product.name}</h2>
          <p className="product-price">Ksh {product.price}</p>
          <p className="product-description">{product.description}</p>
          <p
            className={`product-stock ${
              product.stock_quantity <= 0 ? "text-danger" : ""
            }`}
          >
            <strong>Stock:</strong>{" "}
            {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <div className="rating-display">
            {Array(fullStars).fill("★")}
            {halfStar && "☆"}
            {Array(5 - fullStars - (halfStar ? 1 : 0)).fill("☆")}
            <span className="average-text">({avg} out of 5)</span>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
          />

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-theme" onClick={handleAddToCart}>
              🛒 Add to Cart
            </button>
            <AddToWishlistButton
              productId={product.id}
              onSuccess={() => toast.success("Added to cart!")}
            />
          </div>
        </Col>
      </Row>

      {/* Reviews & Related */}
      <ReviewList productId={id} />
      <RelatedProducts productId={id} />

      {/* Out-Of-Stock Modal */}
      <Modal
        show={showOutOfStockModal}
        onHide={() => setShowOutOfStockModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Out of Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>Sorry, this product is currently out of stock.</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowOutOfStockModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
