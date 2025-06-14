// src/components/Navbar.js
import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Nav } from "react-bootstrap";
import NotificationsBell from "./NotificationsBell";
import AccountModal from "./AccountModal";

const API =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [isAdmin, setIsAdmin] = useState(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Boolean(user.is_admin);
  });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const navigate = useNavigate();

  const fetchWishlist = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/wishlist`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setWishlistCount(Array.isArray(data) ? data.length : 0))
      .catch(console.error);
  };
  const fetchCart = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/cart`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        const items = data.cart_items || data.cartItems || [];
        setCartCount(items.length);
      })
      .catch(console.error);
  };
  const fetchOrders = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API}/orders`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => setOrdersCount(Array.isArray(data) ? data.length : 0))
      .catch(console.error);
  };

  useEffect(() => {
    // Handlers for custom events
    const handleLogin = () => {
      setIsAuthenticated(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAdmin(Boolean(user.is_admin));
      fetchWishlist();
      fetchCart();
      fetchOrders();
    };
    const handleLogout = () => {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setWishlistCount(0);
      setCartCount(0);
      setOrdersCount(0);
    };
    const handleCartUpdated = () => {
      if (isAuthenticated) fetchCart();
    };
    const handleWishlistUpdated = () => {
      if (isAuthenticated) fetchWishlist();
    };
    const handleOrdersUpdated = () => {
      if (isAuthenticated) fetchOrders();
    };

    // Subscribe to window events
    window.addEventListener("login", handleLogin);
    window.addEventListener("logout", handleLogout);
    window.addEventListener("cartUpdated", handleCartUpdated);
    window.addEventListener("wishlistUpdated", handleWishlistUpdated);
    window.addEventListener("ordersUpdated", handleOrdersUpdated);

    // On mount, if already logged in, fetch counts
    if (isAuthenticated) {
      fetchWishlist();
      fetchCart();
      fetchOrders();
    }

    // Cleanup
    return () => {
      window.removeEventListener("login", handleLogin);
      window.removeEventListener("logout", handleLogout);
      window.removeEventListener("cartUpdated", handleCartUpdated);
      window.removeEventListener("wishlistUpdated", handleWishlistUpdated);
      window.removeEventListener("ordersUpdated", handleOrdersUpdated);
    };
  }, [isAuthenticated]);

  const toggleNavbar = () => setIsOpen((o) => !o);

  const handleLogoutClick = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch(`${API.replace("/api", "")}/api/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Logout failed", err);
    }
    // clear and fire logout event
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Thriftify
        </Link>
        <button className="navbar-toggler" onClick={toggleNavbar}>
          <span className="toggler-icon">{isOpen ? "✖" : "☰"}</span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {!isAdmin ? (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Home
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/products"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Products
                  </NavLink>
                </li>

                {/* only show these when logged in */}
                {isAuthenticated && (
                  <>
                    <li className="nav-item position-relative">
                      <NavLink to="/wishlist" className="nav-link">
                        Wishlist ❤️
                        {wishlistCount > 0 && (
                          <span className="badge">{wishlistCount}</span>
                        )}
                      </NavLink>
                    </li>
                    <li className="nav-item position-relative">
                      <NavLink to="/cart" className="nav-link">
                        Cart 🛒
                        {cartCount > 0 && (
                          <span className="badge">{cartCount}</span>
                        )}
                      </NavLink>
                    </li>
                    <li className="nav-item position-relative">
                      <NavLink to="/orders" className="nav-link">
                        Orders
                        {ordersCount > 0 && (
                          <span className="badge">{ordersCount}</span>
                        )}
                      </NavLink>
                    </li>
                    <li>
                      <Nav.Item className="nav-item position-relative">
                        <NotificationsBell />
                      </Nav.Item>
                    </li>
                  </>
                )}
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/admin/products"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Manage Products
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/admin/orders"
                    className={({ isActive }) =>
                      isActive ? "nav-link active" : "nav-link"
                    }
                  >
                    Manage Orders
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center ms-3">
            {!isAuthenticated ? (
              <>
                <Link className="btn btn-outline-terra me-2" to="/login">
                  Login
                </Link>
                <Link className="btn btn-primary" to="/register">
                  Register
                </Link>
              </>
            ) : (
              <div className="dropdown position-relative">
                <button
                  className="btn btn-outline-terra dropdown-toggle"
                  type="button"
                  id="userMenu"
                  data-bs-toggle="dropdown"
                >
                  👤
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end custom-dropdown"
                  aria-labelledby="userMenu"
                >
                  <li className="nav-item">
                    <button
                      className="dropdown-item btn btn-link"
                      onClick={() => setShowAccount(true)}
                    >
                      My Account
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <AccountModal
        show={showAccount}
        handleClose={() => setShowAccount(false)}
      />
    </nav>
  );
}
