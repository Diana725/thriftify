// src/pages/CheckoutPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

export default function CheckoutPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [payMethod, setPayMethod] = useState("M-Pesa");
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load order");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message);
        setLoading(false);
      });
  }, [orderId, token]);

  const handlePayNow = async () => {
    setPayLoading(true);
    try {
      // 1️⃣ Update shipping info on the order
      const patchRes = await fetch(`${API}/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          shipping_address: address,
          shipping_phone: phone,
        }),
      });
      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        throw new Error(patchData.error || "Failed to save shipping info");
      }

      // 2️⃣ Now initiate the IntaSend payment
      const res = await fetch(`${API}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ order_id: order.id }),
      });
      const { checkout_url, error } = await res.json();
      if (!res.ok) {
        throw new Error(error || "Payment initiation failed");
      }

      // 3️⃣ Redirect into IntaSend’s hosted UI
      window.location.href = checkout_url;
    } catch (err) {
      toast.error(err.message);
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

  const { order_items = [] } = order.orderItems
    ? { order_items: order.orderItems }
    : { order_items: [] };

  const total = parseFloat(order.total_amount) || 0;

  return (
    <Container className="py-4">
      <h1 className="mb-4 mt-5">Checkout</h1>
      <Row className="mb-4">
        <Col md={8}>
          {order_items.map((item) => (
            <Card key={item.id} className="mb-3">
              <Card.Body className="d-flex justify-content-between">
                <div>
                  <strong>{item.product.name}</strong> <br />
                  Qty: {item.quantity} &times; ${item.price}
                </div>
                <div>${(item.quantity * item.price).toFixed(2)}</div>
              </Card.Body>
            </Card>
          ))}
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <h5>Total</h5>
              <h2 className="text-primary">${total.toFixed(2)}</h2>

              {/* <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                >
                  <option>M-Pesa</option>
                  <option>Card</option>
                  <option>Bank</option>
                </Form.Select>
              </Form.Group> */}
              <Form.Group className="mb-3">
                <Form.Label>Shipping Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

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
