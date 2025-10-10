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
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import ReviewForm from "../components/ReviewForm";
import "./OrderDetailsPage.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";
const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [payLoading, setPayLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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

  const requestCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch(`${API}/orders/${order.id}/request-cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to send cancellation request");

      toast.success(
        "Your cancellation request was sent. We’ll update you shortly."
      );
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Could not send cancellation request");
    } finally {
      setCancelLoading(false);
    }
  };

  const items = order.order_items || order.orderItems || [];
  const stepIndex = Math.max(0, STATUS_STEPS.indexOf(order.order_status));
  const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;

  return (
    <Container className="py-4 mt-5 mb-5 order-details">
      <h1>Order #{order.id}</h1>
      <p className="meta">{new Date(order.created_at).toLocaleString()}</p>

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

      <Card className="mb-4 order-card">
        <Card.Header>Items</Card.Header>
        <ListGroup variant="flush">
          {items.map((item) => {
            const imgs = item.product.images || [];
            // choose collage density class by count (optional but nice)
            const collageClass =
              imgs.length >= 4
                ? "four"
                : imgs.length === 3
                ? "three"
                : imgs.length === 2
                ? "two"
                : "";
            return (
              <React.Fragment key={item.id}>
                <ListGroup.Item className="order-item">
                  <Row className="align-items-center g-3">
                    <Col md={2}>
                      {(() => {
                        const imgs = item.product?.images || [];
                        const firstSrc =
                          imgs[0] && imgs[0].image_url
                            ? imgs[0].image_url
                            : "/placeholder.png";
                        return (
                          <div className="thumb-single">
                            <img
                              src={firstSrc}
                              alt={`${item.product?.name || "Product"} 1`}
                              loading="lazy"
                              width={96}
                              height={96}
                            />
                          </div>
                        );
                      })()}
                    </Col>

                    <Col md={5}>{item.product.name}</Col>
                    <Col md={2} className="order-line-price">
                      {item.quantity} × Ksh{parseFloat(item.price).toFixed(2)}
                    </Col>
                    <Col md={3} className="order-line-subtotal">
                      Ksh{(item.quantity * parseFloat(item.price)).toFixed(2)}
                    </Col>
                  </Row>
                </ListGroup.Item>

                {order.order_status === "delivered" && (
                  <ListGroup.Item className="order-item">
                    <ReviewForm
                      productId={item.product.id}
                      onSaved={() => {}}
                    />
                  </ListGroup.Item>
                )}
              </React.Fragment>
            );
          })}
        </ListGroup>
        <Card.Footer className="text-end order-total">
          <strong>Total: </strong>
          Ksh{parseFloat(order.total_amount).toFixed(2)}
        </Card.Footer>
      </Card>

      {["pending", "processing"].includes(order.order_status) && (
        <div className="mb-3 text-end">
          <Button
            variant="danger"
            onClick={() => setShowCancelModal(true)}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{" "}
                Sending Request...
              </>
            ) : (
              "Request Cancel"
            )}
          </Button>
        </div>
      )}

      <Button as={Link} to="/orders" variant="secondary">
        ← Back to Orders
      </Button>
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to request cancellation for this order?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            No, Keep Order
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setShowCancelModal(false);
              requestCancel();
            }}
          >
            Yes, Cancel Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
