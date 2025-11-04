import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
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

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <p className="section-subtitle">Experience the difference of home-cooked meals</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">❤️</span>
              <h3>Made with Love</h3>
              <p>Every meal is prepared with care in home kitchens, just like your family would make</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚴</span>
              <h3>Fast Delivery</h3>
              <p>Fresh meals delivered quickly to your office during lunch hours</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Affordable Prices</h3>
              <p>30-50% cheaper than restaurant delivery with better quality</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🥗</span>
              <h3>Healthy & Fresh</h3>
              <p>No preservatives, just fresh ingredients and traditional cooking</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple steps to enjoy home-cooked meals at work</p>
          
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <span className="step-icon">📱</span>
              <h3>Register</h3>
              <p>Create your account and add your office address</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <span className="step-icon">🍽️</span>
              <h3>Browse Meals</h3>
              <p>Choose from fresh home-cooked meals available today</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <span className="step-icon">🛒</span>
              <h3>Place Order</h3>
              <p>Select your meal and preferred delivery time</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <span className="step-icon">🚴</span>
              <h3>Track Delivery</h3>
              <p>Real-time tracking from kitchen to your office</p>
            </div>
            <div className="step-card">
              <div className="step-number">5</div>
              <span className="step-icon">😋</span>
              <h3>Enjoy!</h3>
              <p>Savor your fresh, home-cooked meal</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Taste Home?</h2>
          <p>Join thousands of professionals enjoying home-cooked meals at work</p>
          <Link to="/register" className="btn btn-primary">Get Started Today</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;