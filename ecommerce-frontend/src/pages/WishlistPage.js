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
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [grouped, setGrouped] = useState([]);
  const [search, setSearch] = useState("");
  const [reviewsMap, setReviewsMap] = useState({});
  const token = localStorage.getItem("token");

  // 1️⃣ load wishlist
  useEffect(() => {
    fetch(`${API}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
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
    try {
      const res = await fetch(`${API}/wishlist/${wishId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((i) => i.id !== wishId));
    } catch {
      toast.error("Could not remove");
    }
  };

  // 5️⃣ Move to cart
  const moveToCart = async (productId, wishId) => {
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
      // Optionally remove from wishlist
      removeFromWishlist(wishId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  return (
    <Container className="py-4 mt-5">
      <h1 className="mb-4">My Wishlist</h1>

      <Form.Group className="mb-4" controlId="search">
        <Form.Control
          type="text"
          placeholder="Search wishlist…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Form.Group>

      {grouped.length === 0 ? (
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
                          <strong>${p.price}</strong>
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
                            onClick={() => moveToCart(p.id, item.id)}
                          >
                            🛒 Move to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            Remove
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
    </Container>
  );
}
