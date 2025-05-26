import React from "react";
import "./Newsletter.css";

const Newsletter = () => {
  return (
    <div className="newsletter-container">
      <h2 className="newsletter-title">🎉 Get 10% Off Your First Order!</h2>
      <p className="newsletter-text">
        Subscribe to our newsletter for exclusive deals and latest thrift
        arrivals.
      </p>
      <div className="newsletter-form">
        <input
          type="email"
          placeholder="Enter your email"
          className="email-input"
        />
        <button className="subscribe-btn">Subscribe</button>
      </div>
    </div>
  );
};

export default Newsletter;
