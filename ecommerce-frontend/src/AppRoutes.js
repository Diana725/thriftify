// src/AppRoutes.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Navbar from "./components/Navbar";
import WhyChooseUs from "./components/WhyChooseUs";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import AnimatedRoutes from "./AnimatedRoutes";

export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <AnimatedRoutes />
      <WhyChooseUs />
      {/* <Newsletter /> */}
      <Footer />
    </Router>
  );
}
