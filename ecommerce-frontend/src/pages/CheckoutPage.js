// src/pages/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import "./CheckoutPage.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

export default function CheckoutPage() {
  const { orderId } = useParams(); // route should be /checkout/:orderId
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        // 🔄 use the new endpoint that allows pending orders for the owner
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (res.status === 410) {
          toast.error(
            "Your order reservation expired. Please recreate the order."
          );
          navigate("/cart");
          return;
        }

        if (res.status === 404) {
          toast.error("Order not found or not accessible.");
          navigate("/cart");
          return;
        }

        if (res.status === 401) {
          toast.error("Please sign in to continue.");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          throw new Error("Could not load order");
        }

        const data = await res.json();
        if (!cancelled) setOrder(data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          toast.error(err.message || "Failed to load order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [orderId, token, navigate]);

  const handlePayNow = async () => {
    if (!order) return;
    setPayLoading(true);
    try {
      // use the real order.id if present; otherwise fall back to URL param
      const idForPayment = order?.id ?? orderId;

      const res = await fetch(`${API}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ order_id: idForPayment }),
      });

      const { checkout_url, error } = await res.json();
      if (!res.ok) {
        throw new Error(error || "Payment initiation failed");
      }

      window.location.href = checkout_url;
    } catch (err) {
      toast.error(err.message || "Payment error");
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (!order) {
    return <Container className="py-5">Order not found.</Container>;
  }

  // Support either snake_case (default Eloquent) or camelCase
  const orderItems = Array.isArray(order.order_items)
    ? order.order_items
    : Array.isArray(order.orderItems)
    ? order.orderItems
    : [];

  const total = Number(order.total_amount || 0);

  return (
    <Container className="py-3 my-4 checkout-page">
      <h1 className="mb-4 mt-5">Checkout</h1>
      <Row className="mb-4">
        <Col md={8}>
          {orderItems.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body className="d-flex justify-content-between">
                <div>
                  <strong>{item.product?.name}</strong> <br />
                  Qty: {item.quantity} &times; Ksh
                  {Number(item.price).toFixed(2)}
                </div>
                <div>Ksh{(item.quantity * Number(item.price)).toFixed(2)}</div>
              </Card.Body>
            </Card>
          ))}
        </Col>

        <Col md={4}>
          <Card className="summary-card">
            <Card.Body className="summary">
              {Array.isArray(order.applied_discounts) &&
                order.applied_discounts.length > 0 && (
                  <div className="mb-3">
                    <h6>Discounts Applied:</h6>
                    <ul className="mb-0">
                      {order.applied_discounts.map((desc, i) => (
                        <li key={i} style={{ color: "green" }}>
                          {desc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              <p>
                <strong>Subtotal:</strong> Ksh
                {(
                  Number(total) +
                  Number(order.discount_amount || 0) -
                  Number(order.delivery_fee || 0)
                ).toFixed(2)}
              </p>

              {Number(order.discount_amount) > 0 && (
                <p style={{ color: "green" }}>
                  <strong>Discount:</strong> -Ksh
                  {Number(order.discount_amount).toFixed(2)}
                </p>
              )}

              {Number(order.delivery_fee) > 0 && (
                <p style={{ color: "red" }}>
                  <strong>Delivery Fee:</strong> +Ksh
                  {Number(order.delivery_fee).toFixed(2)}
                </p>
              )}

              <div className="summary-total">
                <span>
                  <strong>Total</strong>
                </span>
                <h2 className="text-primary mb-0">Ksh{total.toFixed(2)}</h2>
              </div>

              <Button
                variant="success"
                className="w-100"
                onClick={handlePayNow}
                disabled={payLoading}
              >
                {payLoading ? "Redirecting…" : "Pay Now"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
