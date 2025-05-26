import React from "react";
import FeaturedProducts from "../components/Homepage/FeaturedProducts";
import HeroBanner from "../components/Homepage/HeroBanner";
import CategoriesGrid from "../components/Homepage/Categories";
import TrendingProducts from "../components/Homepage/TrendingProducts";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      {/* <div className="text-center py-4 bg-danger text-white">
        <h1 className="fw-bold">Welcome to Our Store</h1>
        <p className="fs-5">Find the best styles, handpicked for you.</p>
      </div> */}

      <HeroBanner />
      <CategoriesGrid />
      <FeaturedProducts />
      <TrendingProducts />
    </div>
  );
};

export default Home;
