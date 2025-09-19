import React from "react";
import { Carousel, Container } from "react-bootstrap";
import { motion } from "framer-motion";
import img1 from "../../assets/bags.jpg";
import img2 from "../../assets/brown-shoes-isolated-white-background-studio.jpg";
import img3 from "../../assets/fashion-set.jpg";
import "./HeroBanner.css";

const slides = [
  {
    image: img1,
    title: "Buy 3 Items, Save Ksh 50!",
    subtitle: "Stack up your favorites and save",
  },
  {
    image: img2,
    title: "Free CBD Delivery!",
    subtitle: "On orders above Ksh 1000",
  },
  {
    image: img3,
    title: "10% Off Your First Order",
    subtitle: "Automatically applied at checkout",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroBanner() {
  return (
    <motion.section
      className="hero-section"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      aria-label="Promotions"
    >
      <Container className="px-3 px-md-4">
        <div className="hero-shell rounded-4 shadow-soft overflow-hidden">
          <Carousel controls indicators fade className="hero-carousel">
            {slides.map((slide, idx) => (
              <Carousel.Item key={idx}>
                <div className="hero-media">
                  <img
                    className="hero-image"
                    src={slide.image}
                    alt={slide.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding={idx === 0 ? "auto" : "async"}
                  />
                  {/* gradient mask */}
                  <div className="hero-mask" aria-hidden="true" />
                </div>

                {/* Glass caption */}
                <Carousel.Caption className="hero-caption">
                  {/* Glass promo card */}
                  <div className="promo-panel glass">
                    <h2 className="hero-title">{slide.title}</h2>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                  </div>

                  {/* Buttons now sit below the panel */}
                  <div className="hero-ctas">
                    <a href="/products" className="btn-cta-primary">
                      Shop Now
                    </a>
                    <a href="/collections/new" className="btn-cta-ghost">
                      New Arrivals
                    </a>
                  </div>

                  <ul className="hero-chips" aria-label="Key benefits">
                    <li>Free CBD over KSh 1,000</li>
                    <li>7-day returns</li>
                    <li>Secure checkout</li>
                  </ul>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </Container>
    </motion.section>
  );
}
