import React from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";

const offers = [
  {
    title: "🎉 10% Off First Order",
    description:
      "Enjoy 10% off your first-ever purchase on Thriftify. No code needed — it applies automatically when you checkout as a first-time customer.",
  },
  {
    title: "🛍️ Buy 3 Items, Save Ksh 50",
    description:
      "Buy any 3 or more items in one order and get Ksh 50 off automatically. Great for building stylish bundles!",
  },
  {
    title: "🚚 Free CBD Delivery Over Ksh 1000",
    description:
      "If your total (before delivery) is more than Ksh 1000 and you select 'CBD Delivery', you’ll get FREE delivery automatically.",
  },
];

export default function OffersPage() {
  return (
    <section className="offers-section py-5">
      <Container className="px-3 px-md-4">
        <div className="text-center mb-4">
          <h2 className="offers-title fw-bold mb-1">All Current Offers</h2>
          <p className="offers-subtitle m-0">
            Save more while you thrift. These promos apply automatically at
            checkout.
          </p>
        </div>

        {/* Glassy info note to match hero */}
        <Alert
          variant="light"
          className="offers-note glass border-0 text-center fw-semibold"
        >
          Offers can change at any time — check back often so you never miss a
          deal.
        </Alert>

        <Row className="gy-4">
          {offers.map((offer, index) => (
            <Col md={6} lg={4} key={index}>
              <Card className="offer-card shadow-soft border-0 rounded-4 h-100">
                <Card.Body className="p-4 d-flex flex-column">
                  <span className="offer-tag badge rounded-pill align-self-start mb-3">
                    Limited
                  </span>

                  <Card.Title as="h3" className="offer-heading h5 fw-bold mb-2">
                    {offer.title}
                  </Card.Title>

                  <Card.Text className="text-muted mb-4 flex-grow-1">
                    {offer.description}
                  </Card.Text>

                  <div className="d-flex gap-2">
                    <a href="/products" className="btn-offer-primary">
                      Shop eligible items
                    </a>
                    {/* <a href="/faq" className="btn-offer-ghost">
                      How it works
                    </a> */}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
}
