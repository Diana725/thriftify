import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Spinner,
  Alert,
  Table,
  Button,
  Form,
  Row,
  Col,
  Card,
} from "react-bootstrap";

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  // 1. Fetch the order on mount
  useEffect(() => {
    fetch(`http://localhost:8000/api/admin/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not fetch order #${id}`);
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // 2. Inline status update
  const handleStatusChange = async (newStatus) => {
    setStatusSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/api/admin/orders/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ order_status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Update failed");
      }
      const { order: updated } = await res.json();
      setOrder((o) => ({ ...o, order_status: updated.order_status }));
      setAlert({ variant: "success", message: "Status updated." });
    } catch (err) {
      console.error(err);
      setAlert({ variant: "danger", message: err.message });
    } finally {
      setStatusSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error)
    return (
      <Alert variant="danger" className="mt-5">
        {error}
      </Alert>
    );

  // calculate order total
  const total = order.order_items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );

  return (
    <div className="container mt-5 pt-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        &larr; Back to Orders
      </Button>
      <h2>Order #{order.id}</h2>

      {alert && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>Customer Info</Card.Header>
            <Card.Body>
              <p>
                <strong>Name:</strong> {order.user.name}
              </p>
              <p>
                <strong>Email:</strong> {order.user.email}
              </p>
              <p>
                <strong>Delivery Address:</strong> {order.shipping_address}
              </p>
              <p>
                <strong>Phone:</strong> {order.shipping_phone}
              </p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>Order Details</Card.Header>
            <Card.Body>
              <p>
                <strong>Placed:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Form.Select
                  size="sm"
                  value={order.order_status}
                  disabled={statusSaving}
                  onChange={(e) => handleStatusChange(e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((item) => {
            const price = parseFloat(item.price);
            return (
              <tr key={item.id}>
                <td className="d-flex align-items-center">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    width={50}
                    className="me-2 rounded"
                  />
                  {item.product.name}
                </td>
                <td>{item.quantity}</td>
                <td>${price.toFixed(2)}</td>
                <td>${(price * item.quantity).toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan="3" className="text-end">
              Total:
            </th>
            <th>${total.toFixed(2)}</th>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
}
