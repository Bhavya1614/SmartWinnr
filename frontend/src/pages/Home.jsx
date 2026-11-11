
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-label">WELCOME TO SMARTWINNR</span>

          <h1>
            Discover Restaurants.<br />
            Share Your Experience.
          </h1>

          <p>
            Find the best restaurants around you, explore different cuisines
            and share your honest reviews with everyone.
          </p>

          <div className="hero-buttons">
            <Link to="/restaurants" className="primary-btn">
              Explore Restaurants
            </Link>

            <Link to="/register" className="secondary-btn">
              Join Us
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2>Why SmartWinnr?</h2>
        <p>Everything you need to discover great dining experiences.</p>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🍽️ Explore Restaurants</h3>
            <p>Discover restaurants and explore different cuisines.</p>
          </div>

          <div className="feature-card">
            <h3>⭐ Ratings & Reviews</h3>
            <p>Read customer experiences and share your feedback.</p>
          </div>

          <div className="feature-card">
            <h3>🔍 Smart Search</h3>
            <p>Find restaurants by name, location and cuisine.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
