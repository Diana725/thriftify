// src/components/AddToWishlistButton.js
import React, { useState, useEffect, useContext } from "react";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://www.thriftify.website:8000/api";

export default function AddToWishlistButton({ productId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const authToken = localStorage.getItem("token");
  const { isAuthenticated, setShowAuth } = useContext(AuthContext);

  // 1️⃣ On mount, fetch the user's wishlist and see if this product is there
  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE_URL}/wishlist`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not load wishlist");
        return res.json();
      })
      .then((items) => {
        if (!isMounted) return;
        // your wishlist items come back as { id, product: { id, … } }
        if (items.some((w) => w.product.id === productId)) {
          setAdded(true);
        }
      })
      .catch((err) => {
        if (isMounted) console.error(err);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, authToken]);

  // 2️⃣ Add-to-wishlist handler
  const addToWishlist = async () => {
    if (!isAuthenticated) {
      setShowAuth(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("wishlistUpdated"));
        toast.success("Added to your wishlist!");
        setAdded(true);
        onSuccess && onSuccess(productId);
      } else if (res.status === 409) {
        toast.info("This item is already in your wishlist.");
        setAdded(true);
      } else {
        const { message } = await res.json();
        throw new Error(message || "Failed to add to wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={added ? "danger" : "outline-danger"}
      onClick={addToWishlist}
      disabled={loading || added}
    >
      {added ? "In Wishlist" : loading ? "Adding…" : "❤️ Add to Wishlist"}
    </Button>
  );
}
