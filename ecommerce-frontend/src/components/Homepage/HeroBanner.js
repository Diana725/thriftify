import React from "react";
import { Carousel } from "react-bootstrap";
import { motion } from "framer-motion";
import img1 from "../../assets/bags.jpg";
import img2 from "../../assets/brown-shoes-isolated-white-background-studio.jpg";
import img3 from "../../assets/fashion-set.jpg";
import "./HeroBanner.css";

const slides = [
  {
    image: img1,
    title: "Big Discounts!",
    subtitle: "Get up to 50% off on selected items",
  },
  {
    image: img2,
    title: "New Arrivals",
    subtitle: "Check out our latest thrifted finds",
  },
  {
    image: img3,
    title: "Best Sellers",
    subtitle: "Most loved items by our customers",
  },
];

// Fade-in slide-up variant
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

export default function HeroBanner() {
  return (
    <motion.section
      className="hero-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeInUp}
    >
      <Carousel controls indicators fade className="hero-carousel">
        {slides.map((slide, idx) => (
          <Carousel.Item key={idx}>
            <img
              className="hero-image"
              src={slide.image}
              alt={slide.title}
              loading="lazy"
            />
            <Carousel.Caption className="hero-caption">
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-subtitle">{slide.subtitle}</p>
              <a href="/products" className="hero-cta-button">
                Shop Now
              </a>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>
    </motion.section>
  );
}
