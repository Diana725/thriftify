import React, { useState, useEffect } from "react";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  ListGroup,
  ProgressBar,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./OrdersPage.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

// Keep 4 steps so "processing" appears ~50% through the journey
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];
const VISIBLE_STATUSES = ["processing", "shipped", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterStatus, setFilterStatus] = useState("all");

  const apiOrigin = API.replace("/api", "");

  useEffect(() => {
    let isMounted = true;
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      if (isMounted) setLoading(false);
      return;
    }

    // Fetch and hide non-visible statuses defensively (in case backend changes)
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load orders");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const clean = Array.isArray(data)
          ? data.filter((o) => VISIBLE_STATUSES.includes(o.order_status))
          : [];
        setOrders(clean);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // Realtime updates: if an order transitions to a hidden status, remove it
    const channel = window.Echo.private(`orders.${user.id}`);
    channel.listen(".order.status.updated", (event) => {
      const { id, status, updated_at } = event; // using your current payload
      if (!isMounted) return;

      setOrders((prev) => {
        const visible = VISIBLE_STATUSES.includes(status);
        const next = prev.map((o) =>
          o.id === id ? { ...o, order_status: status, updated_at } : o
        );
        return visible ? next : next.filter((o) => o.id !== id);
      });
    });

    return () => {
      isMounted = false;
      window.Echo.leave(`orders.${user.id}`);
    };
  }, []);

  function pickItemImage(item) {
    // Prefer product.image_url (if backend set it), otherwise first image in the array
    return (
      item?.product?.image_url || item?.product?.images?.[0]?.image_url || ""
    );
  }

  function toAbsoluteImageUrl(url) {
    if (!url) return "";
    // If backend already sent a full https URL, use it as-is
    if (/^https?:\/\//i.test(url)) return url;

    // Handle common relative cases
    const origin = window.location.origin; // e.g. https://www.thriftify.website
    if (url.startsWith("/storage/")) return `${origin}${url}`;
    if (url.startsWith("storage/")) return `${origin}/${url}`;
    if (url.startsWith("images/")) return `${origin}/storage/${url}`;

    // Last resort: try to find /storage/ inside and rebuild
    const i = url.lastIndexOf("/storage/");
    return i !== -1 ? `${origin}${url.substring(i)}` : `${origin}/${url}`;
  }

  function normalizeImageUrl(rawUrl) {
    if (!rawUrl) return "";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    if (rawUrl.startsWith("/storage/")) {
      return apiOrigin + rawUrl;
    }
    const idx = rawUrl.lastIndexOf("/storage/");
    return idx !== -1 ? apiOrigin + rawUrl.substring(idx) : rawUrl;
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortType === "date") {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    }
    if (sortType === "amount") {
      const amtA = parseFloat(a.total_amount);
      const amtB = parseFloat(b.total_amount);
      return sortOrder === "desc" ? amtB - amtA : amtA - amtB;
    }
    if (sortType === "status") {
      const statusA = a.order_status.toLowerCase();
      const statusB = b.order_status.toLowerCase();
      return sortOrder === "desc"
        ? statusB.localeCompare(statusA)
        : statusA.localeCompare(statusB);
    }
    return 0;
  });

  const filteredOrders = sortedOrders.filter(
    (o) => filterStatus === "all" || o.order_status === filterStatus
  );

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-5 orders-page text-center">
        <Alert variant="info">
          You have no orders yet. <Link to="/">Start shopping &rarr;</Link>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 mt-5 mb-5 orders-page">
      <h1 className="mb-4">My Orders</h1>

      {/* Only show customer-visible statuses */}
      <div className="mb-3 d-flex flex-wrap gap-2">
        {["all", ...VISIBLE_STATUSES].map((status) => (
          <Button
            key={status}
            size="sm"
            variant={filterStatus === status ? "primary" : "outline-secondary"}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="mb-3 text-end">
        <DropdownButton
          variant="outline-secondary"
          size="sm"
          title={`Sort: ${
            sortType === "date"
              ? `Date (${sortOrder === "desc" ? "Newest" : "Oldest"})`
              : sortType === "amount"
              ? `Amount (${sortOrder === "desc" ? "High" : "Low"})`
              : `Status (${sortOrder === "desc" ? "Z-A" : "A-Z"})`
          }`}
        >
          <Dropdown.Item
            onClick={() => {
              setSortType("date");
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
            }}
          >
            By Date ({sortOrder === "desc" ? "Oldest First" : "Newest First"})
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setSortType("amount");
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
            }}
          >
            By Total Amount (
            {sortOrder === "desc" ? "Low to High" : "High to Low"})
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              setSortType("status");
              setSortOrder(sortOrder === "desc" ? "asc" : "desc");
            }}
          >
            By Status ({sortOrder === "desc" ? "A-Z" : "Z-A"})
          </Dropdown.Item>
        </DropdownButton>
      </div>

      {filteredOrders.length === 0 && (
        <Alert variant="info" className="text-center">
          No orders with status “{filterStatus}”.
        </Alert>
      )}

      {filteredOrders.map((order) => {
        const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.order_status));
        const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;

        return (
          <Card className="mb-4" key={order.id}>
            <Card.Header>
              <Row>
                <Col>
                  <strong>Order #{order.id}</strong>
                </Col>
                <Col className="text-end text-muted">
                  {new Date(order.created_at).toLocaleString()}
                </Col>
              </Row>
            </Card.Header>

            <Card.Body>
              <ProgressBar
                now={progress}
                label={
                  order.order_status.charAt(0).toUpperCase() +
                  order.order_status.slice(1)
                }
                className="mb-4"
              />

              <ListGroup variant="flush">
                {order.order_items.map((item) => (
                  <ListGroup.Item key={item.id}>
                    <Row className="align-items-center">
                      <Col md={2}>
                        <img
                          src={toAbsoluteImageUrl(pickItemImage(item))}
                          alt={item.product?.name || "Product image"}
                          className="img-fluid rounded"
                          // loading="lazy"
                          // onError={(e) => {
                          //   e.currentTarget.src = "/placeholder.png";
                          // }}
                        />
                      </Col>
                      <Col md={6}>{item.product.name}</Col>
                      <Col md={2}>
                        {item.quantity} × Ksh
                        {parseFloat(item.price).toFixed(2)}
                      </Col>
                      <Col md={2}>
                        Ksh
                        {(item.quantity * parseFloat(item.price)).toFixed(2)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>

            <Card.Footer className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Total:</strong> Ksh
                {parseFloat(order.total_amount).toFixed(2)}
              </div>
              <Button
                as={Link}
                to={`/orders/${order.id}`}
                size="sm"
                className="view-more"
              >
                View Details
              </Button>
            </Card.Footer>
          </Card>
        );
      })}
    </Container>
  );
}
