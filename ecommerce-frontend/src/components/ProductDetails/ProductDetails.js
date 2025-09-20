import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Modal, Button, Carousel } from "react-bootstrap";
import AddToWishlistButton from "./AddToWishlistButton";
import ReviewList from "./ReviewList";
import RelatedProducts from "./RelatedProducts";
import "./ProductDetails.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../../contexts/AuthContext";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);

  const [isLightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (i) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const prevImg = () =>
    setLightboxIndex((i) => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setLightboxIndex((i) => (i + 1) % imgs.length);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isLightboxOpen]);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const shareUrl = `${window.location.origin}/products/${id}`;

  const handleShare = async () => {
    try {
      const shareTitle = product ? product.name : "Check this out";
      const shareText = product ? `${product.name} — Ksh ${product.price}` : "";
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      // Fallback: copy to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
        return;
      }

      // Last-resort fallback (HTTP / older browsers)
      const tmp = document.createElement("input");
      tmp.value = shareUrl;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand("copy");
      document.body.removeChild(tmp);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error(err);
      // Try copying if share failed mid-flight
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard");
      } catch {
        toast.error("Couldn’t share the link.");
      }
    }
  };

  // put near the top of the component (after useState/useContext)
  const imgs = React.useMemo(() => {
    const list =
      Array.isArray(product?.images) && product?.images.length
        ? product.images
        : [{ image_url: "/images/placeholder.png" }];
    return list.slice(0, 8);
  }, [product]);

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
  const avg = Number(product?.average_rating ?? 0);
  const fullStars = Math.floor(avg);
  const halfStar = avg - fullStars >= 0.5;
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    if (product.stock_quantity <= 0) {
      setShowOutOfStockModal(true);
      return;
    }

    setCartLoading(true);

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
      .catch(() => toast.error("Failed to add to Cart"))
      .finally(() => setCartLoading(false));
  };

  return (
    <Container className="product-details py-4 mb-5">
      <Row className="align-items-center">
        <Col md={6}>
          {/* Images collage (replace the Carousel block with this) */}
          <div className="gallery-collage shadow rounded-4">
            {imgs.slice(0, 4).map((img, i) => (
              <button
                key={i}
                type="button"
                className={`gallery-cell ${i === 0 ? "hero" : ""}`}
                onClick={() => openLightbox(i)} // <-- opens the lightbox
                aria-label="Open image"
                style={{ all: "unset", cursor: "zoom-in", display: "block" }}
              >
                <img
                  src={img.image_url}
                  alt={`${product.name} ${i + 1}`}
                  className="gallery-img fade-image"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => e.currentTarget.classList.add("loaded")}
                />
              </button>
            ))}
          </div>
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

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-theme"
              onClick={handleAddToCart}
              disabled={cartLoading}
              style={cartLoading ? { opacity: 0.6, cursor: "not-allowed" } : {}}
            >
              {cartLoading ? "Adding To Cart..." : "🛒 Add to Cart"}
            </button>

            <AddToWishlistButton
              productId={product.id}
              className="add-to-wishlist-btn"
            />

            <button
              className="btn btn-outline-secondary btn-share"
              onClick={handleShare}
              title="Share product"
            >
              🔗 Share
            </button>
          </div>
        </Col>
      </Row>

      {/* Reviews & Related */}
      <ReviewList productId={id} />
      <RelatedProducts productId={id} />

      {isLightboxOpen && (
        <div
          className="lb-overlay"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <div className="lb-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              className="lb-close"
              onClick={closeLightbox}
              aria-label="Close"
            >
              ×
            </button>

            <button
              className="lb-nav prev"
              onClick={prevImg}
              aria-label="Previous"
            >
              ‹
            </button>
            <figure className="lb-figure">
              <img
                src={imgs[lightboxIndex].image_url}
                alt={`Zoomed: ${product.name}`}
                className="lb-image"
                loading="eager"
              />
            </figure>
            <button className="lb-nav next" onClick={nextImg} aria-label="Next">
              ›
            </button>

            <div className="lb-thumbs">
              {imgs.map((m, tIdx) => (
                <button
                  key={tIdx}
                  className={`lb-thumb ${
                    tIdx === lightboxIndex ? "is-active" : ""
                  }`}
                  onClick={() => setLightboxIndex(tIdx)}
                  aria-label={`View image ${tIdx + 1}`}
                >
                  <img src={m.image_url} alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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

      <Button as={Link} to="/products" variant="secondary">
        ← Back to Products
      </Button>
    </Container>
  );
}
