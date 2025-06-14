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
      const res = await fetch(
        "https://www.thriftify.website:8000/api/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

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
      <div className="footer-top container">
        {/* Newsletter Signup */}
        <div className="footer-section newsletter">
          <h3>Stay in the Loop</h3>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {subscribed && (
            <p className="text-white mt-2">Thanks for subscribing! 🎉</p>
          )}
          {error && <p className="text-danger mt-2">{error}</p>}
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <Link to="/shop">Shop</Link>
            </li>
            <li>
              <Link to="/categories">Categories</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/faqs">FAQs</Link>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="footer-section payments">
          <h3>Payment Methods</h3>
          <div className="payment-icons">
            <FaCcVisa title="Visa" />
            <FaCcMastercard title="MasterCard" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p>Email: support@thriftify.com</p>
          <p>Phone: +254 700 000 000</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>
          © 2025 Thriftify. All Rights Reserved |{" "}
          <Link to="/terms">Terms of Service</Link>
        </p>
      </div>
    </footer>
  );
}
