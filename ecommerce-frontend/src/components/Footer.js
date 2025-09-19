import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaCcVisa,
  FaCcMastercard,
} from "react-icons/fa";
import "./Footer.css";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError("");
    setSubscribed(false);

    try {
      const res = await fetch("https://www.thriftify.website/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <footer className="footer">
      <div className="footer-top container footer-shell">
        {/* Newsletter */}
        <div className="footer-section newsletter">
          <h3>Stay in the Loop</h3>
          <div className="newsletter-card glass-lite shadow-soft">
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
              <button type="submit" className="btn-pill">
                Subscribe
              </button>
            </form>
            {subscribed && (
              <p className="text-success mt-2">Thanks for subscribing! 🎉</p>
            )}
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/products">Products</Link>
            </li>
            <li>
              <Link to="/offers">Offers</Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" aria-label="Facebook" className="icon-chip">
              {" "}
              <FaFacebook />{" "}
            </a>
            <a href="#" aria-label="Instagram" className="icon-chip">
              {" "}
              <FaInstagram />{" "}
            </a>
            <a href="#" aria-label="Twitter" className="icon-chip">
              {" "}
              <FaTwitter />{" "}
            </a>
          </div>
        </div>

        {/* Payments */}
        <div className="footer-section payments">
          <h3>Payment Methods</h3>
          <div className="payment-icons">
            <span className="pay-chip">IntaSend</span>
            <span className="pay-chip">MPesa</span>
            <span className="pay-chip">Visa/Mastercard</span>
            <span className="pay-chip">Apple Pay</span>
            <span className="pay-chip">Google Pay</span>
          </div>
          <p className="tiny-note mt-2">Processed securely via IntaSend</p>
        </div>

        {/* Contact */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: thriftify999@gmail.com</p>
          <p>Phone: +254 785848954</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2025 Thriftify. All Rights Reserved •{" "}
          <Link to="/terms">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}
