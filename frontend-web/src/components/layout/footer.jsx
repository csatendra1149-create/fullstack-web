import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <span className="logo-icon">🏠</span>
              <span>HomeTaste Flavours</span>
            </div>
            <p className="footer-tagline">Your Home, Your Flavours, Delivered.</p>
            <p className="footer-desc">
              Revolutionizing food delivery in Nepal by connecting home kitchens with workplaces.
            </p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">🏠 Home</Link></li>
              <li><Link to="/meals">🍽️ Meals</Link></li>
              <li><Link to="/orders">📦 Orders</Link></li>
              <li><Link to="/profile">👤 Profile</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Cities</h4>
            <ul className="footer-links">
              <li>🏙️ Birgunj</li>
              <li>🌆 Kathmandu</li>
              <li>🏔️ Pokhara</li>
              <li>🗺️ More Coming...</li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li>📧 c.satendra1149@gmail.com</li>
              <li>📱 +977 9807258278</li>
              <li>📍 Birgunj, Nepal</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} HomeTaste Flavours. All rights reserved.</p>
          <p>Made with ❤️ by Satendra</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;