// src/pages/WishlistPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Modal,
  ToastContainer,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./WishList.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [search, setSearch] = useState("");
  const [reviewsMap, setReviewsMap] = useState({});
  const token = localStorage.getItem("token");
  const [loadingState, setLoadingState] = useState({ id: null, action: null });

  const [loading, setLoading] = useState(true);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);

  // 1️⃣ load wishlist
  useEffect(() => {
    setLoading(true); // 👈 start loading
    fetch(`${API}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false)); // 👈 end loading
  }, [token]);

  // 2️⃣ fetch reviews for each product
  useEffect(() => {
    items.forEach((item) => {
      const pid = item.product.id;
      if (reviewsMap[pid]) return; // already fetched
      fetch(`${API}/products/${pid}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((revs) => setReviewsMap((m) => ({ ...m, [pid]: revs })))
        .catch((_) => {
          // ignore
        });
    });
  }, [items, token, reviewsMap]);

  // 3️⃣ regroup whenever items or search changes
  useEffect(() => {
    const filtered = items.filter((item) =>
      item.product.name.toLowerCase().includes(search.toLowerCase())
    );

    const map = {};
    filtered.forEach((item) => {
      // if you did the backend eager-load, use:
      //   const cat = item.product.categories?.[0]?.name || "Uncategorized";
      // otherwise fallback:
      const cat =
        item.product.categories?.[0]?.name ??
        item.product.category?.name ??
        "Uncategorized";

      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });

    setGrouped(
      Object.entries(map).map(([categoryName, items]) => ({
        categoryName,
        items,
      }))
    );
  }, [items, search]);

  // 4️⃣ Remove from wishlist
  const removeFromWishlist = async (wishId) => {
    setLoadingState({ id: wishId, action: "remove" });
    try {
      const res = await fetch(`${API}/wishlist/${wishId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((i) => i.id !== wishId));
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch {
      toast.error("Could not remove");
    } finally {
      setLoadingState({ id: null, action: null });
    }
  };

  // 5️⃣ Move to cart
  const moveToCart = async (productId, wishId, stockQuantity) => {
    if (stockQuantity <= 0) {
      setShowOutOfStockModal(true);
      return;
    }

    setLoadingState({ id: wishId, action: "move" });

    try {
      await fetch(`${API}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      toast.success("Moved to cart");
      window.dispatchEvent(new Event("cartUpdated"));
      removeFromWishlist(wishId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setLoadingState({ id: null, action: null });
    }
  };

  return (
    <Container className="wishlist-page py-4 my-5">
      <h1 className="mb-4">My Wishlist</h1>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      /> */}

      <Form.Group className="mb-4" controlId="search">
        <Form.Control
          type="text"
          placeholder="Search wishlist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form.Group>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status" />
          <div className="mt-2">Loading your wishlist…</div>
        </div>
      ) : grouped.length === 0 ? (
        <p>
          No items found. <Link to="/products">Browse products &rarr;</Link>
        </p>
      ) : (
        grouped.map(({ categoryName, items }) => (
          <section key={categoryName} className="mb-5">
            <h3 className="mb-3">{categoryName}</h3>
            <Row className="g-4">
              {items.map((item) => {
                const p = item.product;
                const revs = reviewsMap[p.id] || [];
                const avgRating =
                  revs.length > 0
                    ? (
                        revs.reduce((sum, r) => sum + r.rating, 0) / revs.length
                      ).toFixed(1)
                    : null;

                return (
                  <Col md={4} lg={3} key={item.id}>
                    <Card className="h-100">
                      <Card.Img
                        variant="top"
                        src={p.image_url || "/placeholder.png"}
                      />
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="fs-6">{p.name}</Card.Title>
                        <Card.Text className="mb-2">
                          <strong>Ksh{p.price}</strong>
                        </Card.Text>
                        {avgRating ? (
                          <Card.Text className="mb-2">
                            ⭐ {avgRating} ({revs.length})
                          </Card.Text>
                        ) : (
                          <Card.Text className="text-muted mb-2">
                            No reviews
                          </Card.Text>
                        )}
                        <div className="mt-auto d-flex gap-2">
                          <Button size="sm" as={Link} to={`/products/${p.id}`}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() =>
                              moveToCart(p.id, item.id, p.stock_quantity)
                            }
                            disabled={
                              loadingState.id === item.id &&
                              loadingState.action === "move"
                            }
                          >
                            {loadingState.id === item.id &&
                            loadingState.action === "move" ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />{" "}
                                Moving...
                              </>
                            ) : (
                              "🛒 Move to Cart"
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeFromWishlist(item.id)}
                            disabled={
                              loadingState.id === item.id &&
                              loadingState.action === "remove"
                            }
                          >
                            {loadingState.id === item.id &&
                            loadingState.action === "remove" ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                />{" "}
                                Removing...
                              </>
                            ) : (
                              "Remove"
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </section>
        ))
      )}

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
