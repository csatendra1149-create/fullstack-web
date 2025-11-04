import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle,
  footer,
  hoverable = false,
  className = '' 
}) => {
  return (
    <div className={`custom-card ${hoverable ? 'hoverable' : ''} ${className}`}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="card-body">
        {children}
      </div>
      
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;