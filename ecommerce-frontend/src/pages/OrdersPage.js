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
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

// define your order-status steps in the order they occur
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiOrigin = API.replace("/api", "");
  useEffect(() => {
    let isMounted = true;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      if (isMounted) setLoading(false);
      return;
    }

    // 1️⃣ Fetch initial orders
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load orders");
        return res.json();
      })
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    // 2️⃣ Subscribe to updates
    const channel = window.Echo.private(`orders.${user.id}`);
    channel.listen(".order.status.updated", (event) => {
      const { id, status, updated_at } = event;
      if (isMounted) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === id
              ? { ...order, order_status: status, updated_at }
              : order
          )
        );
      }
    });

    return () => {
      isMounted = false;
      window.Echo.leave(`orders.${user.id}`);
    };
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          You have no orders yet. <Link to="/">Start shopping &rarr;</Link>
        </Alert>
      </Container>
    );
  }
  function normalizeImageUrl(rawUrl) {
    const idx = rawUrl.lastIndexOf("/storage/");
    if (idx !== -1) {
      return apiOrigin + rawUrl.substring(idx);
    }
    return rawUrl;
  }
  return (
    <Container className="py-4 mt-5">
      <h1 className="mb-4">My Orders</h1>

      {orders.map((order) => {
        const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.order_status));
        const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;

        return (
          <Card className="mb-5" key={order.id}>
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
                          src={normalizeImageUrl(item.product.image_url)}
                          alt={item.product.name}
                          className="img-fluid rounded"
                        />
                      </Col>
                      <Col md={6}>{item.product.name}</Col>
                      <Col md={2}>
                        {item.quantity} × Ksh{parseFloat(item.price).toFixed(2)}
                      </Col>
                      <Col md={2}>
                        Ksh{(item.quantity * parseFloat(item.price)).toFixed(2)}
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
              <Button as={Link} to={`/orders/${order.id}`} size="sm">
                View Details
              </Button>
            </Card.Footer>
          </Card>
        );
      })}
    </Container>
  );
}
