import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect } from "react";
import "./App.css";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import Navbar from "./components/Navbar";
import WhyChooseUs from "./components/WhyChooseUs";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import ProductDetailsPage from "./pages/ProductDetails";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage";
import AuthModal from "./components/AuthModal";
import { AuthContext } from "./contexts/AuthContext";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export default function AppRoutes() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { showAuth, setShowAuth } = useContext(AuthContext);

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <AuthModal show={showAuth} onHide={() => setShowAuth(false)} />
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <Home />
              </AnimatedPage>
            }
          />
          <Route
            path="/products/:id"
            element={
              <AnimatedPage>
                <ProductDetailsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/checkout/:orderId"
            element={
              <AnimatedPage>
                <CheckoutPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/payment/confirmationpage"
            element={
              <AnimatedPage>
                <PaymentSuccessPage />
              </AnimatedPage>
            }
          />
          <Route path="/add-product" element={<AddProduct />} />
          <Route
            path="/products"
            element={
              <AnimatedPage>
                <ProductPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/products/category/:categoryId"
            element={
              <AnimatedPage>
                <ProductPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/orders/:orderId"
            element={
              <AnimatedPage>
                <OrderDetailsPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/login"
            element={
              <AnimatedPage>
                <LoginPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/verify-email"
            element={
              <AnimatedPage>
                <VerifyEmailPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AnimatedPage>
                <ForgotPasswordPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AnimatedPage>
                <ResetPasswordPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/wishlist"
            element={
              <AnimatedPage>
                <WishlistPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/register"
            element={
              <AnimatedPage>
                <RegisterPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/cart"
            element={
              <AnimatedPage>
                <CartPage />
              </AnimatedPage>
            }
          />
          <Route
            path="/orders"
            element={
              <AnimatedPage>
                <OrdersPage />
              </AnimatedPage>
            }
          />
          <Route path="/admin/products" element={<AdminProductsPage />} />
          <Route path="/admin/orders" element={<AdminOrdersPage />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetailsPage />} />
        </Routes>
      </AnimatePresence>
      <WhyChooseUs />
      <Footer />
    </Router>
  );
}
