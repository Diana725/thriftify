// src/pages/AdminProductsPage.js
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Badge } from "react-bootstrap";
import CategoryManager from "../components/AdminComponents/CategoryManager";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // for multi-select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    categories: [],
    image: null,
  });

  // 1. Fetch products & categories on mount
  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/api/products").then((res) => res.json()),
      fetch("http://127.0.0.1:8000/api/categories").then((res) => res.json()),
    ])
      .then(([productsData, cats]) => {
        setProducts(productsData);
        setCategories(cats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  // 2. Handlers for Create / Edit modal
  function openCreateModal() {
    setIsEditing(false);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      categories: [],
      image: null,
    });
    setShowModal(true);
  }

  function openEditModal(product) {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      categories: product.categories.map((c) => c.id),
      image: null, // only upload a new one if changed
    });
    setShowModal(true);
  }

  function handleFormChange(e) {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((fd) => ({ ...fd, image: files[0] }));
    } else if (name === "categories") {
      // handle multi-select
      const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
      setFormData((fd) => ({ ...fd, categories: opts }));
    } else {
      setFormData((fd) => ({ ...fd, [name]: value }));
    }
  }

  // 3. Submit handler for Create / Update
  async function handleSubmit(e) {
    e.preventDefault();
    const url = isEditing
      ? `http://127.0.0.1:8000/api/products/${currentProduct.id}`
      : "http://127.0.0.1:8000/api/products";
    // console.log("Submitting to:", url);

    const method = "POST";
    const body = new FormData();
    if (isEditing) body.append("_method", "PUT");
    Object.entries(formData).forEach(([key, val]) => {
      if (val !== null) {
        if (Array.isArray(val)) {
          val.forEach((v) => body.append("categories[]", v));
        } else {
          body.append(key, val);
        }
      }
    });

    try {
      const res = await fetch(url, {
        method,
        headers: {
          // no Content-Type header when sending FormData
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body,
      });
      if (!res.ok) throw new Error("Validation or server error");
      const saved = await res.json();

      // Update local list
      setProducts((list) => {
        if (isEditing) {
          return list.map((p) => (p.id === saved.id ? saved : p));
        }
        return [saved, ...list];
      });
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Save failed: " + err.message);
    }
  }

  // 4. Delete handler
  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) throw new Error("Delete failed");
      setProducts((list) => list.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  // 5. Render
  if (loading) return <Spinner animation="border" />;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-5 pt-5">
      <CategoryManager onCategoriesChange={setCategories} />
      <h2>Manage Products</h2>
      <Button className="mb-3" onClick={openCreateModal}>
        + New Product
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Categories</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                {p.image_url ? (
                  <img src={p.image_url} alt="" width={50} />
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>${parseFloat(p.price).toFixed(2)}</td>
              <td>{p.stock_quantity}</td>
              <td>
                {p.categories.map((c) => (
                  <Badge bg="info" className="me-1" key={c.id}>
                    {c.name}
                  </Badge>
                ))}
              </td>
              <td>
                <Button size="sm" onClick={() => openEditModal(p)}>
                  Edit
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(p.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Product" : "New Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Stock Quantity</Form.Label>
              <Form.Control
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Categories</Form.Label>
              <Form.Select
                name="categories"
                multiple
                value={formData.categories}
                onChange={handleFormChange}
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFormChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
