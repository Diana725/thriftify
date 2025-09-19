import React from "react";
import { CurrencyDollar, Shop, StarFill } from "react-bootstrap-icons";
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
    icon: <Shop size={40} className="feature-icon" />,
    title: "Support A Local Business",
    description:
      "Empower a small, local seller by shopping from your community and helping businesses grow.",
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
    <section className="why-choose-container">
      <h2 className="why-title">🌟 Why Choose Us?</h2>
      {/* Optional subtitle: remove if you don't want it */}
      {/* <p className="why-subtitle">Hand-picked thrift. Honest prices. Boutique experience.</p> */}

      <div className="features-grid">
        {features.map((feature) => (
          <div key={feature.id} className="feature-card shadow-soft">
            <div className="icon-pill">{feature.icon}</div>
            <h3 className="feature-title">{feature.title}</h3>
            <p className="feature-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
