import React, { useState } from "react";
import { Modal, Nav, Tab, Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import GoogleAuthButton from "../utils/GoogleAuthButton";
import "./AuthModal.css";

const API =
  process.env.REACT_APP_API_BASE_URL || "https://www.thriftify.website/api";

export default function AuthModal({ show, onHide }) {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const navigate = useNavigate();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirm, setShowRegisterConfirm] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("login"));
      toast.success("Logged in!");
      onHide();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login error");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("login"));
      toast.success("Account created!");
      onHide();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration error");
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="auth-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {activeTab === "login" ? "Log In" : "Register"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item>
              <Nav.Link eventKey="login">Login</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="register">Register</Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="login">
              <GoogleAuthButton className="google-btn" />

              <div className="or-divider d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">OR</span>
                <hr className="flex-grow-1" />
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    className="auth-input"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="loginPassword">
                  <Form.Label>Password</Form.Label>
                  <InputGroup className="auth-input-group">
                    <Form.Control
                      type={showLoginPassword ? "text" : "password"}
                      className="auth-input"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      className="reveal-toggle"
                      onClick={() => setShowLoginPassword((v) => !v)}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button type="submit" className="w-100 btn-auth-primary">
                  Log In
                </Button>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="register">
              <GoogleAuthButton className="google-btn" />

              <div className="or-divider d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 text-muted">OR</span>
                <hr className="flex-grow-1" />
              </div>

              <Form onSubmit={handleRegister}>
                <Form.Group className="mb-3" controlId="regName">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="auth-input"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="regEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    className="auth-input"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="regPassword">
                  <Form.Label>Password</Form.Label>
                  <InputGroup className="auth-input-group">
                    <Form.Control
                      type={showRegisterPassword ? "text" : "password"}
                      className="auth-input"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      className="reveal-toggle"
                      onClick={() => setShowRegisterPassword((v) => !v)}
                    >
                      {showRegisterPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="regPasswordConfirm">
                  <Form.Label>Confirm Password</Form.Label>
                  <InputGroup className="auth-input-group">
                    <Form.Control
                      type={showRegisterConfirm ? "text" : "password"}
                      className="auth-input"
                      value={registerData.password_confirmation}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password_confirmation: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      className="reveal-toggle"
                      onClick={() => setShowRegisterConfirm((v) => !v)}
                    >
                      {showRegisterConfirm ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Button type="submit" className="w-100 btn-auth-primary">
                  Register
                </Button>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>
    </Modal>
  );
}
