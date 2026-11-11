
import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function OwnerDashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    cuisine: "",
    phone: "",
    email: "",
    image: ""
  });

  const loadData = async () => {
    try {
      const response = await API.get("/restaurants");

      const assigned = response.data.restaurants.filter(
        (restaurant) =>
          restaurant.owner?._id === user?.id ||
          restaurant.owner?._id === user?._id
      );

      setRestaurants(assigned);

      if (assigned.length > 0) {
        const restaurant = assigned[0];
        setSelected(restaurant);

        setForm({
          name: restaurant.name || "",
          description: restaurant.description || "",
          location: restaurant.location || "",
          address: restaurant.address || "",
          cuisine: restaurant.cuisine?.join(", ") || "",
          phone: restaurant.phone || "",
          email: restaurant.email || "",
          image: restaurant.image || ""
        });

        const reviewResponse = await API.get(
          `/restaurants/${restaurant._id}/reviews`
        );

        setReviews(reviewResponse.data.reviews);
      }
    } catch (error) {
      setMessage("Unable to load owner dashboard.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateRestaurant = async (e) => {
    e.preventDefault();

    try {
      await API.put(`/restaurants/${selected._id}`, {
        ...form,
        cuisine: form.cuisine
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      setMessage("Restaurant details updated successfully!");
      loadData();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to update restaurant."
      );
    }
  };

  if (!selected) {
    return (
      <div className="dashboard-page">
        <h1>Restaurant Owner Dashboard</h1>
        <p>{message || "No restaurant has been assigned to your account."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h1>Restaurant Owner Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      {message && <p className="status-message">{message}</p>}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h2>{selected.averageRating?.toFixed(1) || "0.0"}</h2>
          <p>Average Rating</p>
        </div>
        <div className="stat-card">
          <h2>{selected.totalReviews || reviews.length}</h2>
          <p>Total Reviews</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Update Restaurant Details</h2>

        <form className="dashboard-form" onSubmit={updateRestaurant}>
          {Object.keys(form).map((field) => (
            <input
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              value={form[field]}
              onChange={(e) =>
                setForm({ ...form, [field]: e.target.value })
              }
              required={field !== "email" && field !== "image"}
            />
          ))}

          <button type="submit">Save Changes</button>
        </form>
      </section>

      <section className="dashboard-section">
        <h2>Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p>No customer reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div className="dashboard-card" key={review._id}>
              <h3>{review.customer?.name || "Customer"}</h3>
              <p>⭐ {review.rating} / 5</p>
              <p>{review.comment}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default OwnerDashboard;
