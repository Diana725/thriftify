import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Modal } from "react-bootstrap";

export default function ReviewForm({ productId, onSaved }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // form fields
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [existingReview, setExistingReview] = useState(null);

  // 1) Fetch existing review (if any)
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/reviews?product_id=${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log("reviews GET→", data);
        if (data.length) {
          const r = data[0];
          setExistingReview(r);
          setRating(r.rating);
          setReviewText(r.review_text || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  // 2) Submit handler (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = existingReview
      ? `http://127.0.0.1:8000/api/reviews/${existingReview.id}`
      : "http://127.0.0.1:8000/api/reviews";
    const method = existingReview ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          rating,
          review_text: reviewText,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || res.statusText);
      }
      setSuccess("Review saved!");
      setExistingReview(await res.json().then((r) => r.review ?? r));
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // 3) Delete handler
  const handleDeleteClick = () => setShowConfirm(true);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/reviews/${existingReview.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Delete failed");
      // reset form state…
      setExistingReview(null);
      setRating(5);
      setReviewText("");
      setSuccess("Review deleted");
      onSaved?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setShowConfirm(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (loading) return <Spinner animation="border" size="sm" />;

  return (
    <Form onSubmit={handleSubmit} className="border p-3 mb-4">
      <h6>Your Review</h6>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form.Group className="mb-2">
        <Form.Label>Rating</Form.Label>
        <div>
          {[1, 2, 3, 4, 5].map((n) => (
            <Form.Check
              inline
              key={n}
              label={`${n}★`}
              name="rating"
              type="radio"
              id={`rating-${n}`}
              checked={rating === n}
              onChange={() => setRating(n)}
            />
          ))}
        </div>
      </Form.Group>
      <Form.Group className="mb-2">
        <Form.Label>Review</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          maxLength={1000}
        />
      </Form.Group>
      <Button type="submit" disabled={saving}>
        {saving
          ? "Saving…"
          : existingReview
          ? "Update Review"
          : "Submit Review"}
      </Button>{" "}
      {existingReview && (
        <Button
          variant="outline-danger"
          disabled={deleting}
          onClick={handleDeleteClick}
        >
          {deleting ? "Deleting…" : "Delete Review"}
        </Button>
      )}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete your review?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Form>
  );
}
