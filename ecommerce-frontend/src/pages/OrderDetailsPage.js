// src/pages/OrderDetailsPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { toast } from "react-toastify";
import ReviewForm from "../components/ReviewForm";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000/api";
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/orders/${orderId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load order details");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Order not found.</Alert>
      </Container>
    );
  }

  const items = order.order_items || order.orderItems || [];
  const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.order_status));
  const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;

  return (
    <Container className="py-4 mt-5">
      <h1>Order #{order.id}</h1>
      <p className="text-muted">
        {new Date(order.created_at).toLocaleString()}
      </p>

      <ProgressBar
        now={progress}
        label={
          order.order_status.charAt(0).toUpperCase() +
          order.order_status.slice(1)
        }
        className="mb-4"
      />

      {order.shipping_address && (
        <Card className="mb-4">
          <Card.Header>Shipping Details</Card.Header>
          <Card.Body>
            <p>
              <strong>Address:</strong> {order.shipping_address}
            </p>
            <p>
              <strong>Phone:</strong> {order.shipping_phone}
            </p>
          </Card.Body>
        </Card>
      )}

      <Card className="mb-4">
        <Card.Header>Items</Card.Header>
        <ListGroup variant="flush">
          {items.map((item) => (
            <React.Fragment key={item.id}>
              <ListGroup.Item>
                <Row className="align-items-center">
                  <Col md={2}>
                    <img
                      src={item.product.image_url || "/placeholder.png"}
                      alt={item.product.name}
                      className="img-fluid rounded"
                    />
                  </Col>
                  <Col md={5}>{item.product.name}</Col>
                  <Col md={2}>
                    {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                  </Col>
                  <Col md={3}>
                    ${(item.quantity * parseFloat(item.price)).toFixed(2)}
                  </Col>
                </Row>
              </ListGroup.Item>

              {order.order_status === "delivered" && (
                <ListGroup.Item>
                  <ReviewForm
                    productId={item.product.id}
                    onSaved={() => {
                      /* optionally re-fetch product ratings or
                         update parent state if needed */
                    }}
                  />
                </ListGroup.Item>
              )}
            </React.Fragment>
          ))}
        </ListGroup>
        <Card.Footer className="text-end">
          <strong>Total: </strong>${parseFloat(order.total_amount).toFixed(2)}
        </Card.Footer>
      </Card>

      <Button as={Link} to="/orders" variant="secondary">
        ← Back to Orders
      </Button>
    </Container>
  );
}
