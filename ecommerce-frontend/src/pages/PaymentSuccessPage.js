// src/pages/PaymentSuccessPage.js
import React from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function PaymentSuccessPage() {
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
