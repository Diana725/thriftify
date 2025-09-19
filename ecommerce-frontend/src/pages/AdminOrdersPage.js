import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, Form, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  // 1. Fetch all orders on mount
  useEffect(() => {
    fetch("https://www.thriftify.website/api/admin/orders", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load orders");
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 2. Handler for status filter
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // 3. Update order status inline
  const handleStatusChange = async (orderId, newStatus) => {
    setSavingId(orderId);
    try {
      const res = await fetch(
        `https://www.thriftify.website/api/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: JSON.stringify({ order_status: newStatus }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Save failed");
      }
      const { order } = await res.json();
      setOrders((list) =>
        list.map((o) =>
          o.id === order.id ? { ...o, order_status: order.order_status } : o
        )
      );
      setAlert({
        type: "success",
        message: `Order #${order.id} status updated.`,
      });
    } catch (err) {
      console.error(err);
      setAlert({ type: "danger", message: err.message });
    } finally {
      setSavingId(null);
      // auto-dismiss after 3s
      setTimeout(() => setAlert(null), 3000);
    }
  };

  // 4. Filter orders client-side
  const visibleOrders = orders.filter(
    (o) => filterStatus === "all" || o.order_status === filterStatus
  );

  if (loading) return <Spinner animation="border" className="mt-5" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-5 pt-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h2>Manage Orders</h2>
        </Col>
        <Col md="auto">
          <Form.Select value={filterStatus} onChange={handleFilterChange}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {alert && (
        <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
          {alert.message}
        </Alert>
      )}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items #</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {visibleOrders.map((o) => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.user.name}</td>
              <td>{o.order_items.length}</td>
              <td style={{ minWidth: "140px" }}>
                <Form.Select
                  size="sm"
                  value={o.order_status}
                  disabled={savingId === o.id}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                >
                  {STATUSES.filter((s) => s.value !== "all").map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>
                <Button
                  size="sm"
                  onClick={() => navigate(`/admin/orders/${o.id}`)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))}

          {visibleOrders.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
