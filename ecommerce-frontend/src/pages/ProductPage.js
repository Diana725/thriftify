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
} from "react-bootstrap";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CategoriesGrid from "../components/Homepage/Categories";
import "./ProductPage.css";
import { AuthContext } from "../contexts/AuthContext";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const productsPerPage = 20;
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      // if logged out, clear the list
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
          // extract product_id from each wishlist entry
          const ids = Array.isArray(data) ? data.map((w) => w.product_id) : [];
          setWishlistIds(ids);
        })
        .catch((err) => console.error("Error fetching wishlist:", err));
    };

    fetchWishlist();

    // re-fetch if wishlistUpdated event is fired
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
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [categoryId]);

  // sort when sortOption changes
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

  // pagination
  const last = currentPage * productsPerPage;
  const first = last - productsPerPage;
  const pageProducts = products.slice(first, last);
  const pageCount = Math.ceil(products.length / productsPerPage);

  const handleAddToCart = (id) => {
    if (!isAuthenticated) {
      // show login/register prompt
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
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <ToastContainer position="top-right" autoClose={2000} />

      <Container className="py-4">
        {/* Filters */}
        <CategoriesGrid />
        {/* 2) Search Bar */}
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

        {/* Sort */}
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

        {/* Product Grid */}
        <Row className="g-4">
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Col key={i} xs={12} sm={6} md={4} lg={3}>
                  {/* skeleton loader */}
                </Col>
              ))
            : pageProducts.map((prod) => {
                const inWishlist = wishlistIds.includes(prod.id);
                return (
                  <Col key={prod.id} xs={12} sm={6} md={4} lg={3}>
                    <div className="product-card">
                      <Link to={`/products/${prod.id}`}>
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="product-image fade-image"
                          loading="lazy"
                          onLoad={(e) =>
                            e.currentTarget.classList.add("loaded")
                          }
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
                          <div>
                            <button
                              className="btn btn-wishlist btn-sm me-2"
                              onClick={() =>
                                !inWishlist && handleAddToWishlist(prod.id)
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
                            <button
                              className="btn btn-cart btn-sm"
                              onClick={() => handleAddToCart(prod.id)}
                            >
                              🛒
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                );
              })}
        </Row>

        {/* Pagination */}
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
    </motion.section>
  );
}
