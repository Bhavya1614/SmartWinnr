
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function RestaurantDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const [restaurantResponse, reviewResponse] = await Promise.all([
        API.get(`/restaurants/${id}`),
        API.get(`/restaurants/${id}/reviews`)
      ]);

      setRestaurant(restaurantResponse.data.restaurant);
      setReviews(reviewResponse.data.reviews);
    } catch (error) {
      setMessage("Unable to load restaurant details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/reviews", {
        restaurantId: id,
        rating: Number(rating),
        comment
      });

      setComment("");
      setRating(5);
      setMessage("Review submitted successfully!");
      await fetchDetails();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to submit review."
      );
    }
  };

  if (loading) return <p className="status-message">Loading...</p>;

  if (!restaurant) {
    return <p className="status-message">Restaurant not found.</p>;
  }

  return (
    <div className="details-page">
      <div className="details-card">
        {restaurant.image && (
          <img src={restaurant.image} alt={restaurant.name} />
        )}

        <h1>{restaurant.name}</h1>
        <p>{restaurant.description}</p>
        <p>📍 {restaurant.location}</p>
        <p>Address: {restaurant.address}</p>
        <p>🍴 {restaurant.cuisine?.join(", ")}</p>
        <p>Phone: {restaurant.phone}</p>

        <h3>
          ⭐ {restaurant.averageRating?.toFixed(1) || "0.0"} / 5
        </h3>

        <p>{restaurant.totalReviews || 0} customer reviews</p>
      </div>

      <section className="reviews-section">
        <h2>Customer Reviews</h2>

        {message && <p className="status-message">{message}</p>}

        {user?.role === "customer" && (
          <form className="review-form" onSubmit={submitReview}>
            <h3>Write Your Review</h3>

            <label>Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[5, 4, 3, 2, 1].map((number) => (
                <option key={number} value={number}>
                  {number} Stars
                </option>
              ))}
            </select>

            <label>Your Comment</label>
            <textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              minLength={2}
              maxLength={1000}
            />

            <button type="submit">Submit Review</button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div className="review-card" key={review._id}>
              <h4>{review.customer?.name || "Customer"}</h4>
              <p>⭐ {review.rating} / 5</p>
              <p>{review.comment}</p>
              <small>
                {new Date(review.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default RestaurantDetails;
