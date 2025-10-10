import { Container, Row, Col, Accordion, Form, Button } from "react-bootstrap";
import "./Contact.css";
import contact_img from "../assets/pexels-alex-andrews-271121-821754.jpg";

export default function ContactHelpPage() {
  return (
    <div className="py-4 contact-hero-shell">
      {/* Hero */}
      <section className="contact-hero rounded-4 shadow-soft overflow-hidden">
        <div className="contact-hero-media">
          <img
            src={contact_img} /* replace with your image */
            alt="Concierge support"
            className="contact-hero-img"
          />
          <div className="contact-hero-mask" />
          <div className="contact-hero-caption glass">
            <h1 className="contact-title">We’re here to help</h1>
            <p className="contact-subtitle">
              Fast, friendly support—typically within a few minutes to 1 hour.
            </p>
          </div>
        </div>
      </section>

      <Container className="py-4 py-md-5">
        <Row className="g-4">
          {/* Contact cards */}
          <Col md={6} lg={4}>
            <div className="contact-card glass-lite shadow-soft">
              <h3>Email</h3>
              <p className="mb-2">Prefer writing? We reply quickly.</p>
              <a className="contact-link" href="mailto:thriftify999@gmail.com">
                thriftify999@gmail.com
              </a>
            </div>
          </Col>
          <Col md={6} lg={4}>
            <div className="contact-card glass-lite shadow-soft">
              <h3>Phone / WhatsApp</h3>
              <p className="mb-2">Mon–Sat, 9am–7pm (EAT).</p>
              <a className="contact-link" href="tel:+254785848954">
                +254 785 848 954
              </a>
            </div>
          </Col>
          <Col lg={4}>
            <div className="contact-card glass-lite shadow-soft">
              <h3>Response Time</h3>
              <p className="mb-0">
                Most messages are answered in <strong>minutes</strong>. Always
                within <strong>1 hour</strong> during working time.
              </p>
            </div>
          </Col>
        </Row>

        {/* Optional form (no backend needed) */}
        <Row className="g-4 mt-1">
          <Col lg={7}>
            <div className="glass-lite shadow-soft p-3 p-md-4 rounded-4">
              <h3 className="mb-3">Send us a message</h3>
              {/* Option 1: mailto (zero backend) */}
              <Form
                action="https://formspree.io/f/your-id" /* or remove and use mailto */
                method="POST"
                className="contact-form"
              >
                {/* If you truly want zero service, delete action, and onSubmit redirect to mailto: */}
                <Row className="g-3">
                  <Col sm={6}>
                    <Form.Control
                      name="name"
                      type="text"
                      placeholder="Your name"
                      required
                      className="input-pill"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Control
                      name="email"
                      type="email"
                      placeholder="Your email"
                      required
                      className="input-pill"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Control
                      name="phone"
                      type="text"
                      placeholder="Phone (optional)"
                      className="input-pill"
                    />
                  </Col>
                  <Col sm={6}>
                    <Form.Control
                      name="order"
                      type="text"
                      placeholder="Order # (optional)"
                      className="input-pill"
                    />
                  </Col>
                  <Col xs={12}>
                    <Form.Control
                      name="message"
                      as="textarea"
                      rows={4}
                      placeholder="How can we help?"
                      className="textarea-soft"
                      required
                    />
                  </Col>
                </Row>
                <div className="d-flex gap-2 mt-3">
                  <Button type="submit" className="btn-luxe-primary">
                    Send
                  </Button>
                  <a
                    href="mailto:thriftify999@gmail.com?subject=Support%20Request"
                    className="btn btn-luxe-ghost"
                  >
                    Use Email App
                  </a>
                </div>
                <small className="d-block mt-2 opacity-75">
                  By sending, you agree to be contacted about your request.
                </small>
              </Form>
            </div>
          </Col>

          {/* FAQs */}
          <Col lg={5}>
            <div className="glass-lite shadow-soft p-3 p-md-4 rounded-4">
              <h3 className="mb-3">FAQs</h3>
              <Accordion flush alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>How do I place an order?</Accordion.Header>
                  <Accordion.Body>
                    <ul className="list-steps">
                      <li>
                        Browse products and tap <strong>Add to cart</strong>.
                      </li>
                      <li>
                        Open the cart and confirm item, size, and quantity.
                      </li>
                      <li>
                        Proceed to <strong>Checkout</strong> and fill delivery
                        details.
                      </li>
                      <li>
                        Select <strong>IntaSend</strong> and follow the payment
                        prompts.
                      </li>
                      <li>
                        That’s it! You’ll receive an order confirmation via
                        email.
                      </li>
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Can I cancel my order?</Accordion.Header>
                  <Accordion.Body>
                    You can request a cancellation while the order is still{" "}
                    <strong>Processing</strong>. Go to{" "}
                    <strong>
                      Orders → the specific order → Request Cancel
                    </strong>
                    . If the order has moved to <strong>Shipped</strong>,
                    cancellation isn’t available—please check our Returns below.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>
                    What’s your returns policy?
                  </Accordion.Header>
                  <Accordion.Body>
                    We offer a <strong>7-day returns window</strong> from the
                    day you receive your item for unworn items (tags on,
                    original packaging).
                    <ul className="list-steps">
                      <li>
                        Start a return: reply to your order email or message us
                        with your <strong>Order #</strong> and reason.
                      </li>
                      <li>
                        We approve and share the return address/label options.
                      </li>
                      <li>Ship the item back within 3 days of approval.</li>
                      <li>
                        Once received and checked, we refund to your original
                        payment method within 2–5 business days.
                      </li>
                    </ul>
                    <em>Notes:</em> For size/style change, you can request an
                    exchange if stock allows. Return shipping is covered by the
                    buyer unless the item was incorrect or faulty.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>Delivery timelines & fees</Accordion.Header>
                  <Accordion.Body>
                    Delivery options and costs are shown at checkout. Many
                    Nairobi CBD orders qualify for{" "}
                    <strong>free delivery over KSh 1000</strong>. You’ll see ETA
                    and fees before payment.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
