import React from 'react';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: '❤️',
      title: 'Made with Love',
      description: 'Every meal is prepared with care in home kitchens, just like your family would make'
    },
    {
      icon: '🚴',
      title: 'Fast Delivery',
      description: 'Fresh meals delivered quickly to your office during lunch hours'
    },
    {
      icon: '💰',
      title: 'Affordable Prices',
      description: '30-50% cheaper than restaurant delivery with better quality'
    },
    {
      icon: '🥗',
      title: 'Healthy & Fresh',
      description: 'No preservatives, just fresh ingredients and traditional cooking'
    }
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Why Choose Us?</h2>
        <p className="section-subtitle">Experience the difference of home-cooked meals</p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;