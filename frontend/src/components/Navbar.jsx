
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">SmartWinnr</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/restaurants">Restaurants</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="nav-register">Register</Link>
          </>
        ) : (
          <>
            {user.role === "admin" && <Link to="/admin">Dashboard</Link>}
            {user.role === "owner" && <Link to="/owner">Dashboard</Link>}
            {user.role === "customer" && <Link to="/customer">Dashboard</Link>}

            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
