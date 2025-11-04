import React from 'react';
import './HowItWorks.css';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: '📱',
      title: 'Register',
      description: 'Create your account and add your office address'
    },
    {
      number: 2,
      icon: '🍽️',
      title: 'Browse Meals',
      description: 'Choose from fresh home-cooked meals available today'
    },
    {
      number: 3,
      icon: '🛒',
      title: 'Place Order',
      description: 'Select your meal and preferred delivery time'
    },
    {
      number: 4,
      icon: '🚴',
      title: 'Track Delivery',
      description: 'Real-time tracking from kitchen to your office'
    },
    {
      number: 5,
      icon: '😋',
      title: 'Enjoy!',
      description: 'Savor your fresh, home-cooked meal'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple steps to enjoy home-cooked meals at work</p>
        
        <div className="steps-grid">
          {steps.map((step) => (
            <div key={step.number} className="step-card">
              <div className="step-number">{step.number}</div>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;