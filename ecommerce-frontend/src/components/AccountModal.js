import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./AccountModal.css";

export default function AccountModal({ show, handleClose }) {
  const [user, setUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const navigate = useNavigate();
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  });

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // fetch profile when modal opens
  useEffect(() => {
    if (show) {
      setSuccessMessage("");
      setLoading(true);
      fetch("https://www.thriftify.website/api/user", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setFormData({
            name: data.name,
            email: data.email,
            current_password: "",
            password: "",
            password_confirmation: "",
          });
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [show]);

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    fetch("https://www.thriftify.website/api/user", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        setEditMode(false);
        setSuccessMessage(data.message);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    if (!window.confirm("Really delete your account?")) return;
    setLoading(true);
    fetch("https://www.thriftify.website/api/user", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(() => {
        localStorage.clear();
        navigate("/login");
      })
      .catch(console.error);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className="modal-brand" // 👈 attach brand styles
    >
      <Modal.Header closeButton>
        <Modal.Title>My Account</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {successMessage && (
          <Alert
            variant="success"
            onClose={() => setSuccessMessage("")}
            dismissible
            className="alert-brand" // 👈 brand success style
          >
            {successMessage}
          </Alert>
        )}
        {loading && <Spinner animation="border" />}

        {!loading && user && !editMode && (
          <>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </>
        )}

        {!loading && user && editMode && (
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <hr />

            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.current_password ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                />
                <InputGroup.Text
                  className="ig-eye"
                  onClick={() => toggleShow("current_password")}
                  role="button"
                  tabIndex={0}
                >
                  {showPasswords.current_password ? <FiEyeOff /> : <FiEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.password ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <InputGroup.Text
                  className="ig-eye"
                  onClick={() => toggleShow("password")}
                  role="button"
                  tabIndex={0}
                >
                  {showPasswords.password ? <FiEyeOff /> : <FiEye />}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={
                    showPasswords.password_confirmation ? "text" : "password"
                  }
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                />
                <InputGroup.Text
                  className="ig-eye"
                  onClick={() => toggleShow("password_confirmation")}
                  role="button"
                  tabIndex={0}
                >
                  {showPasswords.password_confirmation ? (
                    <FiEyeOff />
                  ) : (
                    <FiEye />
                  )}
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Button type="submit" className="btn-terra" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              className="btn-ghost ms-2"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        {!loading && !editMode && (
          <>
            <Button className="btn-terra" onClick={() => setEditMode(true)}>
              Edit
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
              Delete Account
            </Button>
            <Button className="btn-ghost" onClick={handleClose}>
              Close
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
