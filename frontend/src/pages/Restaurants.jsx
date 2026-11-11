
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

// Default food images based on cuisine
const fallbackImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
];

function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/restaurants", {
        params: { search, location, cuisine }
      });

      setRestaurants(response.data.restaurants);
    } catch (err) {
      setError("Unable to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants();
  };

  const getRestaurantImage = (restaurant, index) => {
    return restaurant.image || fallbackImages[index % fallbackImages.length];
  };

  return (
    <div className="restaurants-page">
      <div className="restaurants-heading">
        <h1>Explore Restaurants</h1>
        <p>Discover delicious food and your favourite restaurants.</p>
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search restaurant name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter cuisine"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
        />

        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p className="status-message">Loading restaurants...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : restaurants.length === 0 ? (
        <div className="empty-message">
          <h2>No Restaurants Found</h2>
          <p>Try another search or check back later.</p>
        </div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((restaurant, index) => (
            <div className="restaurant-card" key={restaurant._id}>
              <img
                className="restaurant-card-image"
                src={getRestaurantImage(restaurant, index)}
                alt={restaurant.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImages[0];
                }}
              />

              <div className="restaurant-info">
                <h3>{restaurant.name}</h3>

                <p>📍 {restaurant.location}</p>

                <p>
                  🍴 {restaurant.cuisine?.join(", ")}
                </p>

                <p>
                  ⭐ {restaurant.averageRating?.toFixed(1) || "0.0"}
                  {" "}({restaurant.totalReviews || 0} reviews)
                </p>

                <Link
                  to={`/restaurants/${restaurant._id}`}
                  className="view-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Restaurants;
