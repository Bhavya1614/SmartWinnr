
import React, { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [restaurantData, setRestaurantData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    cuisine: "",
    phone: "",
    email: ""
  });

  const [assignData, setAssignData] = useState({
    restaurantId: "",
    ownerId: ""
  });

  const [message, setMessage] = useState("");

  // Load dashboard, users and restaurants
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [dashboard, userResponse, restaurantResponse] =
        await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/admin/users"),
          API.get("/restaurants")
        ]);

      setStats(dashboard.data.dashboard);
      setUsers(userResponse.data.users);
      setRestaurants(restaurantResponse.data.restaurants);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load admin data. Please login as admin."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load all customer reviews directly from admin API
  const loadAllReviews = async () => {
    try {
      setLoadingReviews(true);

      const response = await API.get("/admin/reviews");

      setReviews(response.data.reviews || []);

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to load customer reviews."
      );
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadAllReviews();
  }, []);

  // Create restaurant owner
  const createOwner = async (e) => {
    e.preventDefault();

    try {
      await API.post("/admin/owners", ownerData);

      setOwnerData({
        name: "",
        email: "",
        password: ""
      });

      setMessage("Restaurant owner created successfully!");

      await loadDashboard();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Failed to create owner."
      );
    }
  };

  // Add restaurant
  const createRestaurant = async (e) => {
    e.preventDefault();

    try {
      await API.post("/restaurants", {
        ...restaurantData,
        cuisine: restaurantData.cuisine
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });

      setRestaurantData({
        name: "",
        description: "",
        location: "",
        address: "",
        cuisine: "",
        phone: "",
        email: ""
      });

      setMessage("Restaurant created successfully!");

      await loadDashboard();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Failed to create restaurant."
      );
    }
  };

  // Assign restaurant owner
  const assignOwner = async (e) => {
    e.preventDefault();

    try {
      await API.put(
        `/admin/restaurants/${assignData.restaurantId}/assign-owner`,
        { ownerId: assignData.ownerId }
      );

      setAssignData({
        restaurantId: "",
        ownerId: ""
      });

      setMessage("Owner assigned successfully!");

      await loadDashboard();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Failed to assign owner."
      );
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await API.delete(`/admin/users/${id}`);

      setMessage("User deleted successfully!");

      await loadDashboard();
      await loadAllReviews();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to delete user."
      );
    }
  };

  // Deactivate restaurant
  const deleteRestaurant = async (id) => {
    if (!window.confirm("Deactivate this restaurant?")) {
      return;
    }

    try {
      await API.delete(`/restaurants/${id}`);

      setMessage("Restaurant deactivated successfully!");

      await loadDashboard();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to deactivate restaurant."
      );
    }
  };

  // Remove inappropriate review
  const deleteReview = async (id) => {
    if (!window.confirm("Remove this inappropriate review?")) {
      return;
    }

    try {
      await API.delete(`/admin/reviews/${id}`);

      setMessage("Review removed successfully!");

      await loadDashboard();
      await loadAllReviews();

    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        "Unable to remove review."
      );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <h1>Admin Dashboard</h1>
      <p>Manage SmartWinnr application</p>

      {message && (
        <p className="status-message">{message}</p>
      )}

      {/* Dashboard Statistics */}
      {stats && (
        <div className="dashboard-stats">

          <div className="stat-card">
            <h2>{stats.totalUsers}</h2>
            <p>Total Users</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalCustomers}</h2>
            <p>Customers</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalOwners}</h2>
            <p>Owners</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalRestaurants}</h2>
            <p>Restaurants</p>
          </div>

          <div className="stat-card">
            <h2>{stats.totalReviews}</h2>
            <p>Reviews</p>
          </div>

          <div className="stat-card">
            <h2>{stats.averagePlatformRating}</h2>
            <p>Platform Rating</p>
          </div>

        </div>
      )}

      {/* Create Restaurant Owner */}
      <section className="dashboard-section">

        <h2>Create Restaurant Owner</h2>

        <form className="dashboard-form" onSubmit={createOwner}>

          <input
            placeholder="Owner name"
            value={ownerData.name}
            onChange={(e) =>
              setOwnerData({
                ...ownerData,
                name: e.target.value
              })
            }
            required
          />

          <input
            type="email"
            placeholder="Owner email"
            value={ownerData.email}
            onChange={(e) =>
              setOwnerData({
                ...ownerData,
                email: e.target.value
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Temporary password"
            minLength="6"
            value={ownerData.password}
            onChange={(e) =>
              setOwnerData({
                ...ownerData,
                password: e.target.value
              })
            }
            required
          />

          <button type="submit">Create Owner</button>

        </form>
      </section>

      {/* Add Restaurant */}
      <section className="dashboard-section">

        <h2>Add Restaurant</h2>

        <form
          className="dashboard-form"
          onSubmit={createRestaurant}
        >

          {Object.keys(restaurantData).map((field) => (
            <input
              key={field}
              placeholder={
                field.charAt(0).toUpperCase() +
                field.slice(1)
              }
              type={field === "email" ? "email" : "text"}
              value={restaurantData[field]}
              onChange={(e) =>
                setRestaurantData({
                  ...restaurantData,
                  [field]: e.target.value
                })
              }
              required={field !== "email"}
            />
          ))}

          <button type="submit">Add Restaurant</button>

        </form>

        <small>
          Enter multiple cuisines separated by commas.
        </small>

      </section>

      {/* Assign Restaurant Owner */}
      <section className="dashboard-section">

        <h2>Assign Restaurant Owner</h2>

        <form className="dashboard-form" onSubmit={assignOwner}>

          <select
            value={assignData.restaurantId}
            onChange={(e) =>
              setAssignData({
                ...assignData,
                restaurantId: e.target.value
              })
            }
            required
          >
            <option value="">Select Restaurant</option>

            {restaurants.map((restaurant) => (
              <option
                key={restaurant._id}
                value={restaurant._id}
              >
                {restaurant.name}
              </option>
            ))}

          </select>

          <select
            value={assignData.ownerId}
            onChange={(e) =>
              setAssignData({
                ...assignData,
                ownerId: e.target.value
              })
            }
            required
          >
            <option value="">Select Owner</option>

            {users
              .filter((user) => user.role === "owner")
              .map((owner) => (
                <option
                  key={owner._id}
                  value={owner._id}
                >
                  {owner.name} ({owner.email})
                </option>
              ))}

          </select>

          <button type="submit">Assign Owner</button>

        </form>
      </section>

      {/* Manage Users */}
      <section className="dashboard-section">

        <h2>Manage Users</h2>

        {users.map((user) => (
          <div className="dashboard-card" key={user._id}>

            <h3>{user.name}</h3>

            <p>
              {user.email} — {user.role}
            </p>

            {user.role !== "admin" && (
              <button
                className="delete-btn"
                onClick={() => deleteUser(user._id)}
              >
                Delete User
              </button>
            )}

          </div>
        ))}

      </section>

      {/* Manage Restaurants */}
      <section className="dashboard-section">

        <h2>Manage Restaurants</h2>

        {restaurants.map((restaurant) => (
          <div
            className="dashboard-card"
            key={restaurant._id}
          >

            <h3>{restaurant.name}</h3>

            <p>{restaurant.location}</p>

            <p>
              Owner: {restaurant.owner?.name || "Not assigned"}
            </p>

            <button
              className="delete-btn"
              onClick={() => deleteRestaurant(restaurant._id)}
            >
              Deactivate
            </button>

          </div>
        ))}

      </section>

      {/* Manage Customer Reviews */}
      <section className="dashboard-section">

        <h2>Manage Inappropriate Reviews</h2>

        {loadingReviews ? (
          <p>Loading customer reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No customer reviews available.</p>
        ) : (
          reviews.map((review) => (
            <div
              className="dashboard-card"
              key={review._id}
            >

              <h3>
                {review.restaurant?.name || "Restaurant"}
              </h3>

              <p>
                Customer: {review.customer?.name || "Customer"}
              </p>

              <p>
                Email: {review.customer?.email || "Not available"}
              </p>

              <p>
                Rating: ⭐ {review.rating} / 5
              </p>

              <p>
                Review: {review.comment}
              </p>

              <p>
                Date: {new Date(review.createdAt).toLocaleDateString()}
              </p>

              <button
                className="delete-btn"
                onClick={() => deleteReview(review._id)}
              >
                Remove Review
              </button>

            </div>
          ))
        )}

      </section>

    </div>
  );
}

export default AdminDashboard;
