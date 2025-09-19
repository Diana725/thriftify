// src/pages/AdminProductsPage.js
import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Spinner, Badge } from "react-bootstrap";
import CategoryManager from "../components/AdminComponents/CategoryManager";

const API = "https://www.thriftify.website/api";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    categories: [],
    images: [], // up to 4 new files
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/categories`).then((res) => res.json()),
      fetch(`${API}/products`).then((res) => res.json()),
    ])
      .then(([cats, productsData]) => {
        setCategories(cats);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      });
  }, []);

  function openCreateModal() {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      categories: [],
      images: [],
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
      images: [],
    });
    setShowModal(true);
  }

  function handleFormChange(e) {
    const { name, value, files } = e.target;

    if (name === "images") {
      const fileList = Array.from(files).slice(0, 4); // up to 4 files
      setFormData((fd) => ({ ...fd, images: fileList }));
    } else if (name === "categories") {
      const opts = Array.from(e.target.selectedOptions).map((o) => o.value);
      setFormData((fd) => ({ ...fd, categories: opts }));
    } else {
      setFormData((fd) => ({ ...fd, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const url = isEditing
      ? `${API}/products/${currentProduct.id}`
      : `${API}/products`;
    const body = new FormData();

    body.append("name", formData.name);
    body.append("description", formData.description);
    body.append("price", formData.price);
    body.append("stock_quantity", formData.stock_quantity);
    formData.categories.forEach((category) =>
      body.append("categories[]", category)
    );
    formData.images.forEach((img) => body.append("images[]", img));
    if (isEditing) body.append("_method", "PUT");

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body,
      });

      if (!res.ok) throw new Error("Save failed");
      const saved = await res.json();

      setProducts((list) =>
        isEditing
          ? list.map((p) => (p.id === saved.id ? saved : p))
          : [saved, ...list]
      );
      setShowModal(false);
    } catch (error) {
      console.error(error);
      alert(`Error saving product: ${error.message}`);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;

    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Delete failed");
      setProducts((list) => list.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
      alert(`Delete failed: ${error.message}`);
    }
  }

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
            <th>Images</th>
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
                <div className="d-flex flex-wrap" style={{ gap: "0.25rem" }}>
                  {p.images?.length ? (
                    p.images.map((img) => (
                      <img
                        key={img.id}
                        src={`https://www.thriftify.website/storage/${img.image_url}`}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover" }}
                        alt={p.name}
                      />
                    ))
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
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

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Modal.Header closeButton>
            <Modal.Title>
              {isEditing ? "Edit Product" : "New Product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Name */}
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </Form.Group>
            {/* Description */}
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
            {/* Price */}
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
            {/* Stock */}
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
            {/* Categories */}
            <Form.Group className="mb-2">
              <Form.Label>Categories</Form.Label>
              <Form.Select
                multiple
                name="categories"
                value={formData.categories}
                onChange={handleFormChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {/* Images */}
            <Form.Group className="mb-2">
              <Form.Label>Images (up to 4)</Form.Label>
              <Form.Control
                type="file"
                name="images"
                multiple
                accept="image/*"
                onChange={handleFormChange}
              />
              {isEditing && currentProduct?.images?.length > 0 && (
                <div
                  className="mt-2 d-flex flex-wrap"
                  style={{ gap: "0.5rem" }}
                >
                  {currentProduct.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      width={50}
                      height={50}
                      style={{ objectFit: "cover" }}
                      alt="Current image"
                    />
                  ))}
                </div>
              )}
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
