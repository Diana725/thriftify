import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  Row,
  Col,
} from "react-bootstrap";

export default function CategoryManager({ onCategoriesChange }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCat, setCurrentCat] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const API = "http://127.0.0.1:8000/api";

  // Fetch categories
  useEffect(() => {
    fetch(`${API}/categories`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Helper to refresh parent
  function notifyChange(newList) {
    setCategories(newList);
    onCategoriesChange?.(newList);
  }

  // Open create modal
  function openCreate() {
    setIsEditing(false);
    setCurrentCat(null);
    setNameInput("");
    setShowModal(true);
  }

  // Open edit modal
  function openEdit(cat) {
    setIsEditing(true);
    setCurrentCat(cat);
    setNameInput(cat.name);
    setShowModal(true);
  }

  // Handle save (create or update)
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    const url = isEditing
      ? `${API}/categories/${currentCat.id}`
      : `${API}/categories`;
    const method = isEditing ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ name: nameInput }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || "Save failed");

      let updated;
      if (isEditing) {
        updated = categories.map((c) => (c.id === payload.id ? payload : c));
      } else {
        updated = [payload, ...categories];
      }
      notifyChange(updated);
      setAlert({ variant: "success", message: "Saved successfully" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setAlert({ variant: "danger", message: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setAlert(null), 3000);
    }
  }

  // Handle delete
  async function handleDelete(catId) {
    if (!window.confirm("Delete this category?")) return;
    try {
      const res = await fetch(`${API}/categories/${catId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || "Delete failed");
      }
      const filtered = categories.filter((c) => c.id !== catId);
      notifyChange(filtered);
    } catch (err) {
      console.error(err);
      setAlert({ variant: "danger", message: err.message });
      setTimeout(() => setAlert(null), 3000);
    }
  }

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="mb-4">
      <Row className="align-items-center mb-2">
        <Col>
          <h4>Categories</h4>
        </Col>
        <Col md="auto">
          <Button onClick={openCreate}>+ New Category</Button>
        </Col>
      </Row>

      {alert && (
        <Alert
          variant={alert.variant}
          dismissible
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>
                <Button size="sm" onClick={() => openEdit(cat)}>
                  Edit
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan="2" className="text-center text-muted">
                No categories yet.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Category" : "New Category"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                required
                disabled={saving}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
