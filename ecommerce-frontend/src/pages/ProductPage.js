import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Dropdown,
  Pagination,
  Card,
  InputGroup,
  FormControl,
  Button,
  Modal,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoriesGrid from "../components/Homepage/Categories";
import "./ProductPage.css";
import { AuthContext } from "../contexts/AuthContext";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";
const BASEURL = API.replace("/api", "");

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ProductPage() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("newest");
  const [loadingState, setLoadingState] = useState({ id: null, action: null });

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const productsPerPage = 20;
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    window.addEventListener("wishlistUpdated", fetchWishlist);
    return () => {
      window.removeEventListener("wishlistUpdated", fetchWishlist);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);
    const url = categoryId
      ? `${API}/categories/${categoryId}/products`
      : `${API}/products`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  useEffect(() => {
    const sorted = [...products];
    switch (sortOption) {
      case "price_low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setProducts(sorted);
  }, [sortOption]);

  const last = currentPage * productsPerPage;
  const first = last - productsPerPage;
  const pageProducts = products.slice(first, last);
  const pageCount = Math.ceil(products.length / productsPerPage);

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

    setLoadingState({ id: product.id, action: "cart" });

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
        setLoadingState({ id: null, action: null });
      });
  };

  const handleAddToWishlist = (id) => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }

    setLoadingState({ id, action: "wishlist" });

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
      })
      .finally(() => {
        setLoadingState({ id: null, action: null });
      });
  };

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`${API}/products/search?q=${encodeURIComponent(searchTerm)}`)
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = () => {
    setIsLoading(true);
    fetch(`${API}/products/search?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setCurrentPage(1);
        setSuggestions([]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  return (
    <motion.section
      className="products-section"
      initial={false}
      animate="visible"
      variants={fadeInUp}
      style={{ minHeight: "300px" }}
    >
      {/* <ToastContainer position="top-right" autoClose={2000} /> */}

      <Container className="py-1">
        <CategoriesGrid />

        <div className="search-wrapper mb-3 position-relative">
          <InputGroup>
            <FormControl
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Button
              variant="outline-primary"
              className="btn-view-more"
              onClick={handleSearch}
            >
              Search
            </Button>
          </InputGroup>
          {suggestions.length > 0 && (
            <div className="suggestions-list">
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(p.name);
                    setProducts([p]);
                    setSuggestions([]);
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="d-flex justify-content-end mb-3">
          <Dropdown>
            <Dropdown.Toggle className="sort-toggle">
              Sort: {sortOption.replace("_", " ").toUpperCase()}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setSortOption("newest")}>
                Newest
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption("price_low")}>
                Price: Low to High
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortOption("price_high")}>
                Price: High to Low
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <Row className="g-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4} lg={3}>
                  <div className="skeleton skeleton-card"></div>
                </Col>
              ))
            : pageProducts.map((prod) => {
                // console.log("IMAGE", JSON.stringify(prod.image_url));
                const inWishlist = wishlistIds.includes(prod.id);
                return (
                  <Col key={prod.id} xs={12} sm={6} md={4} lg={3}>
                    <div
                      className="product-card"
                      style={{ position: "relative" }}
                    >
                      {/* SOLD badge */}
                      {prod.stock_quantity <= 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "4px",
                            background: "#dc3545", // Bootstrap danger
                            color: "#fff",
                            padding: "4px 6px",
                            fontSize: "12px",
                            fontWeight: 700,

                            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                            zIndex: 2,
                            borderRadius: "4px",
                            pointerEvents: "none",
                            textTransform: "uppercase",
                            letterSpacing: "1px",
                          }}
                        >
                          SOLD
                        </div>
                      )}
                      <Link to={`/products/${prod.id}`}>
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="product-image"
                          onLoad={(e) =>
                            e.currentTarget.classList.add("loaded")
                          }
                          onMouseEnter={(e) => {
                            if (prod.images && prod.images[1]) {
                              e.currentTarget.style.opacity = "0.7";
                              e.currentTarget.src = `https://www.thriftify.website/storage/${prod.images[1].image_url}`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = "1";
                            e.currentTarget.src = prod.image_url; // this is already full URL if you handled it in index
                          }}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                            width: "100%",
                            transition: "0.3s ease-in-out",
                          }}
                        />
                      </Link>

                      <div className="product-body">
                        <Card.Title className="product-title">
                          {prod.name}
                        </Card.Title>
                        <p className="product-price">Ksh {prod.price}</p>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <Link
                            to={`/products/${prod.id}`}
                            className="btn btn-view-more btn-primary btn-sm"
                          >
                            View More
                          </Link>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-wishlist btn-sm d-flex align-items-center justify-content-center"
                              onClick={() =>
                                !inWishlist && handleAddToWishlist(prod.id)
                              }
                              disabled={
                                inWishlist ||
                                (loadingState.id === prod.id &&
                                  loadingState.action === "wishlist")
                              }
                              style={
                                inWishlist ||
                                (loadingState.id === prod.id &&
                                  loadingState.action === "wishlist")
                                  ? { opacity: 0.6, cursor: "not-allowed" }
                                  : {}
                              }
                            >
                              {loadingState.id === prod.id &&
                              loadingState.action === "wishlist" ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "❤️"
                              )}
                            </button>

                            <button
                              className="btn btn-cart btn-sm d-flex align-items-center justify-content-center"
                              onClick={() => handleAddToCart(prod)}
                              disabled={
                                loadingState.id === prod.id &&
                                loadingState.action === "cart"
                              }
                              style={
                                loadingState.id === prod.id &&
                                loadingState.action === "cart"
                                  ? { opacity: 0.6, cursor: "not-allowed" }
                                  : {}
                              }
                            >
                              {loadingState.id === prod.id &&
                              loadingState.action === "cart" ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              ) : (
                                "🛒"
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
        </Row>

        {pageCount > 1 && (
          <Pagination className="mt-4 justify-content-center">
            {Array.from({ length: pageCount }).map((_, i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === currentPage}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </Pagination>
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
