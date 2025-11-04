import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Your Home, Your Flavours, Delivered</h1>
        <p className="hero-subtitle">
          Bringing fresh, homemade meals from your kitchen to your office. 
          Connecting families and professionals throughout Nepal.
        </p>
        <div className="hero-buttons">
          <Link to="/meals" className="btn btn-primary">Browse Meals</Link>
          <Link to="/register" className="btn btn-secondary">Get Started</Link>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">1000+</span>
            <span className="stat-label">Happy Users</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">3</span>
            <span className="stat-label">Cities Covered</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Daily Deliveries</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;