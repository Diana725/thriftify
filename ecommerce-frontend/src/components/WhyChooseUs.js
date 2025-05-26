import React from "react";
import { CurrencyDollar, Recycle, StarFill } from "react-bootstrap-icons";
import "./WhyChooseUs.css";

const features = [
  {
    id: 1,
    icon: <CurrencyDollar size={40} className="feature-icon" />,
    title: "Affordable Prices",
    description:
      "Get trendy outfits at unbeatable thrift prices. Save more while staying stylish!",
  },
  {
    id: 2,
    icon: <Recycle size={40} className="feature-icon" />,
    title: "Sustainable Fashion",
    description:
      "Support eco-friendly shopping by giving clothes a second life and reducing waste.",
  },
  {
    id: 3,
    icon: <StarFill size={40} className="feature-icon" />,
    title: "Unique Styles",
    description:
      "Discover one-of-a-kind pieces that you won’t find in regular retail stores.",
  },
];

const WhyChooseUs = () => {
  return (
    <div className="why-choose-container">
      <h2 className="section-title">🌟 Why Choose Us?</h2>
      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card">
            {feature.icon}
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
