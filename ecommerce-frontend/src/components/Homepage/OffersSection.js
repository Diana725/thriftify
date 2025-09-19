import React from "react";
import "./OfferSection.css";
import { Link } from "react-router-dom";

const offers = [
  {
    title: "🛍️ Buy 3 Items, Save Ksh 50",
    description: "Automatically applied at checkout.",
  },
  { title: "🚚 Free CBD Delivery", description: "On orders above Ksh 1000." },
  {
    title: "🎉 10% Off First Order",
    description: "No code needed – discount applies automatically.",
  },
];

export default function OffersSection() {
  return (
    <section className="offers-section py-5">
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="offers-heading fw-bold mb-1">Current Offers</h2>
          <p className="offers-subtitle m-0">
            Save more while you thrift—applied automatically at checkout.
          </p>
        </div>

        <div className="row g-4">
          {offers.map((offer, i) => (
            <div className="col-md-4" key={i}>
              <div className="offer-card rounded-4 shadow-soft h-100">
                <div className="card-body p-4">
                  <div className="offer-icon mb-3" aria-hidden="true">
                    {offer.title.slice(0, 2) /* keeps your emoji */}
                  </div>
                  <h3 className="card-title offer-title fw-semibold mb-2">
                    {offer.title.replace(/^.. /, "")}
                  </h3>
                  <p className="card-text text-muted mb-0">
                    {offer.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <Link to="/offers" className="btn btn-offers-primary me-2">
            See all offers
          </Link>
          <Link to="/products" className="btn btn-offers-ghost">
            Shop eligible items
          </Link>
        </div>
      </div>
    </section>
  );
}
