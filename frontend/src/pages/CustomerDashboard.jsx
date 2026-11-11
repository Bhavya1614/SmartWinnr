
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function CustomerDashboard() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  const fetchMyReviews = async () => {
    try {
      const response = await API.get("/reviews/my-reviews");
      setReviews(response.data.reviews);
    } catch (err) {
      setError("Unable to load your reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const startEditing = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRating(5);
    setEditComment("");
  };

  const updateReview = async (id) => {
    if (!editComment.trim()) {
      setError("Please enter your review comment.");
      return;
    }

    try {
      const response = await API.put(`/reviews/${id}`, {
        rating: Number(editRating),
        comment: editComment.trim()
      });

      setReviews((previous) =>
        previous.map((review) =>
          review._id === id
            ? { ...review, ...response.data.review }
            : review
        )
      );

      cancelEditing();
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update review."
      );
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await API.delete(`/reviews/${id}`);

      setReviews((previous) =>
        previous.filter((review) => review._id !== id)
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete review."
      );
    }
  };

  return (
    <div className="dashboard-page">
      <h1>Customer Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>{reviews.length}</h2>
          <p>My Reviews</p>
        </div>
      </div>

      <Link to="/restaurants" className="primary-btn">
        Explore Restaurants
      </Link>

      <h2 className="dashboard-section-title">My Reviews</h2>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading your reviews...</p>
      ) : reviews.length === 0 ? (
        <p>You haven't written any reviews yet.</p>
      ) : (
        <div className="dashboard-list">
          {reviews.map((review) => (
            <div className="dashboard-card" key={review._id}>
              <h3>{review.restaurant?.name || "Restaurant"}</h3>

              {editingId === review._id ? (
                <div className="edit-review-form">
                  <label>Update Rating</label>

                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(e.target.value)}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Average</option>
                    <option value="1">1 - Poor</option>
                  </select>

                  <label>Update Comment</label>

                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows="4"
                    placeholder="Write your review..."
                  />

                  <div className="dashboard-actions">
                    <button
                      className="primary-btn"
                      onClick={() => updateReview(review._id)}
                    >
                      Save Changes
                    </button>

                    <button
                      className="delete-btn"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p>⭐ {review.rating} / 5</p>
                  <p>{review.comment}</p>

                  <div className="dashboard-actions">
                    <Link
                      to={`/restaurants/${review.restaurant?._id}`}
                      className="view-btn"
                    >
                      View Restaurant
                    </Link>

                    <button
                      className="primary-btn"
                      onClick={() => startEditing(review)}
                    >
                      Edit Review
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteReview(review._id)}
                    >
                      Delete Review
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
