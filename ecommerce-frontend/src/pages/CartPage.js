import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Button,
  Row,
  Alert,
  Col,
  Image,
  Spinner,
} from "react-bootstrap";
import { InputGroup, FormControl } from "react-bootstrap";
import "./CartPage.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:8000/api";
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [errorMsg, setErrorMsg] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCart(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cart:", error);
        setLoading(false);
      });
  }, []);
  const handleQuantityChange = (itemId, newQty) => {
    if (newQty < 1) return; // don’t go below 1

    fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: "PATCH", // or "/cart/update/${itemId}" if that's your route
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ quantity: newQty }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update quantity");
        return res.json();
      })
      .then(() => {
        setCart((prev) => ({
          ...prev,
          cart_items: prev.cart_items.map((i) =>
            i.id === itemId ? { ...i, quantity: newQty } : i
          ),
        }));
      })
      .catch((err) => console.error(err));
  };

  const handleRemoveItem = (id) => {
    fetch(`${API_BASE_URL}/cart/remove/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => {
        setCart((prev) => ({
          ...prev,
          cart_items: prev.cart_items.filter((i) => i.id !== id),
        }));
      })
      .catch((error) => console.error("Error removing item:", error));
  };

  const handleClearCart = () => {
    fetch(`${API_BASE_URL}/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(() => setCart({ ...cart, cart_items: [] }))
      .catch((error) => console.error("Error clearing cart:", error));
  };

  if (loading)
    return (
      <Container className="cart-page text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );

  const items = cart?.cart_items || [];

  const handleProceedToCheckout = async () => {
    if (!items.length) {
      toast.info("Your cart is empty.");
      return;
    }

    setErrorMsg("");
    setCheckoutLoading(true);

    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // 1️⃣ Always check for a backend "error" field first:
      if (data.error) {
        // specifically handle your stock error:
        if (data.error.startsWith("Not enough stock for")) {
          toast.error(
            `${data.error}. Please reduce the quantity or choose another product.`,
            { autoClose: 4000 }
          );
        } else {
          // any other server-sent message
          toast.error(data.error);
        }
        return;
      }

      // 2️⃣ Then check HTTP status for other non-200 codes
      if (!res.ok) {
        throw new Error("Checkout failed. Please try again.");
      }

      // ✅ Success path
      navigate(`/checkout/${data.order.id}`);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      toast.error(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const total = items
    .reduce(
      (sum, item) => sum + item.quantity * parseFloat(item.product.price),
      0
    )
    .toFixed(2);

  return (
    <Container className="cart-page mt-5 pt-3">
      <h2 className="mb-4">Your Shopping Cart</h2>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />

      {errorMsg && (
        <Alert
          variant="danger"
          onClose={() => setErrorMsg("")}
          dismissible
          className="mt-3"
        >
          {errorMsg}
        </Alert>
      )}

      {items.length === 0 ? (
        <p className="lead">Your cart is empty.</p>
      ) : (
        <>
          <div className="table-responsive">
            <Table responsive hover bordered className="align-middle">
              <thead className="table-light">
                <tr>
                  <th></th>
                  <th>Product</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Unit Price</th>
                  <th className="text-end">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const price = parseFloat(item.product.price).toFixed(2);
                  const subtotal = (item.quantity * price).toFixed(2);

                  return (
                    <tr key={item.id}>
                      <td style={{ width: "80px" }}>
                        <Image
                          src={
                            item.product.image_url ||
                            "https://via.placeholder.com/60"
                          }
                          thumbnail
                          rounded
                          className="product-thumb"
                        />
                      </td>
                      <td>{item.product.name}</td>
                      <td className="text-center">
                        <InputGroup
                          className="justify-content-center"
                          style={{ maxWidth: "120px", margin: "0 auto" }}
                        >
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            –
                          </Button>
                          <FormControl
                            value={item.quantity}
                            readOnly
                            className="text-center px-1"
                          />
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => {
                              if (item.quantity < item.product.stock_quantity) {
                                handleQuantityChange(
                                  item.id,
                                  item.quantity + 1
                                );
                              } else {
                                toast.error(
                                  `"${item.product.name}" is out of stock.`,
                                  { autoClose: 2000 }
                                );
                              }
                            }}
                            disabled={
                              item.quantity >= item.product.stock_quantity
                            }
                          >
                            +
                          </Button>
                        </InputGroup>
                      </td>
                      <td className="text-end">Ksh{price}</td>
                      <td className="text-end">Ksh{subtotal}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          <Row className="justify-content-end">
            <Col md="4">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Total:</h5>
                <h4 className="mb-0">Ksh{total}</h4>
              </div>
            </Col>
          </Row>

          <div className="d-flex justify-content-between mt-4">
            <Button variant="outline-secondary" onClick={handleClearCart}>
              Clear Cart
            </Button>
            <Button
              variant="primary"
              onClick={handleProceedToCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? "Processing…" : "Proceed to Checkout"}
            </Button>
          </div>
        </>
      )}
    </Container>
  );
};

export default CartPage;
