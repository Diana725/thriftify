// src/pages/PaymentSuccessPage.js
import React, { useEffect } from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      fetch("https://www.thriftify.website/api/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(() => {
          // Notify any components listening (e.g., cart icon/nav)
          window.dispatchEvent(new Event("cartUpdated"));
          console.log("Cart cleared after successful payment.");
        })
        .catch((err) => {
          console.error("Failed to clear cart after payment:", err);
        });
    }
  }, []);

  return (
    <Container className="py-5 text-center mt-5">
      <Alert variant="success" className="mb-4">
        🎉 Your payment was successful!
        <br />
        Thank you for your order.
      </Alert>
      <div className="d-flex justify-content-center gap-3">
        <Button as={Link} to="/orders">
          View My Orders
        </Button>
        <Button as={Link} to="/">
          Continue Shopping
        </Button>
      </div>
    </Container>
  );
}
