import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mealAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import { toast } from 'react-toastify';
import Loading from '../components/common/Loading';
import './MealDetail.css';

const MealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchMealDetail();
  }, [id]);

  const fetchMealDetail = async () => {
    try {
      setLoading(true);
      const response = await mealAPI.getMealById(id);
      if (response.success) {
        setMeal(response.meal);
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      toast.error('Failed to load meal details');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNow = () => {
    if (!isAuthenticated) {
      toast.info('Please login to place an order');
      navigate('/login');
      return;
    }

    // Navigate to order page with meal data
    navigate('/checkout', { state: { meal, quantity } });
  };

  if (loading) {
    return <Loading message="Loading meal details..." />;
  }

  if (!meal) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Meal not found</h2>
          <button onClick={() => navigate('/meals')} className="btn btn-primary">
            Browse Meals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="meal-detail-page">
      <div className="container">
        <div className="meal-detail-grid">
          {/* Image Section */}
          <div className="meal-images">
            <div className="main-image">
              {meal.images && meal.images.length > 0 ? (
                <img src={meal.images[selectedImage].url} alt={meal.name} />
              ) : (
                <div className="placeholder-main">🍛</div>
              )}
            </div>
            {meal.images && meal.images.length > 1 && (
              <div className="image-thumbnails">
                {meal.images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img.url} alt={`${meal.name} ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="meal-details">
            <div className="meal-header">
              <h1 className="meal-title">{meal.name}</h1>
              <div className="meal-meta">
                <span className={`badge badge-${meal.foodType}`}>
                  {meal.foodType === 'veg' ? '🥬 Vegetarian' : 
                   meal.foodType === 'non-veg' ? '🍗 Non-Veg' : '🥚 Egg'}
                </span>
                <span className="meal-category-badge">📂 {meal.category}</span>
              </div>
            </div>

            <div className="meal-rating-section">
              <div className="rating-display">
                ⭐ {meal.rating.average > 0 ? meal.rating.average : 'New'}
                {meal.rating.count > 0 && (
                  <span className="rating-count">({meal.rating.count} reviews)</span>
                )}
              </div>
            </div>

            <div className="meal-price-section">
              <span className="price-label">Price:</span>
              <span className="price-value">{formatCurrency(meal.price)}</span>
              <span className="serving-info">/ {meal.servingSize}</span>
            </div>

            <div className="meal-description">
              <h3>Description</h3>
              <p>{meal.description}</p>
            </div>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="meal-ingredients">
                <h3>Ingredients</h3>
                <div className="ingredients-list">
                  {meal.ingredients.map((ingredient, index) => (
                    <span key={index} className="ingredient-tag">
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="meal-info-grid">
              <div className="info-item">
                <span className="info-label">Cuisine:</span>
                <span className="info-value">🌍 {meal.cuisine}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Prep Time:</span>
                <span className="info-value">⏱️ {meal.preparationTime} mins</span>
              </div>
              <div className="info-item">
                <span className="info-label">Spice Level:</span>
                <span className="info-value">🌶️ {meal.spiceLevel}</span>
              </div>
            </div>

            <div className="kitchen-info">
              <h3>Prepared By</h3>
              <div className="kitchen-card">
                <div className="kitchen-icon">👩‍🍳</div>
                <div className="kitchen-details">
                  <h4>{meal.homeKitchen?.kitchenDetails?.kitchenName || meal.homeKitchen?.name}</h4>
                  {meal.homeKitchen?.kitchenDetails?.description && (
                    <p>{meal.homeKitchen.kitchenDetails.description}</p>
                  )}
                  {meal.homeKitchen?.kitchenDetails?.rating > 0 && (
                    <div className="kitchen-rating">
                      ⭐ {meal.homeKitchen.kitchenDetails.rating} 
                      ({meal.homeKitchen.kitchenDetails.totalOrders} orders)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="order-section">
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="order-total">
                <span>Total:</span>
                <span className="total-price">{formatCurrency(meal.price * quantity)}</span>
              </div>

              <button onClick={handleOrderNow} className="btn btn-primary btn-large">
                Order Now
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {meal.reviews && meal.reviews.length > 0 && (
          <div className="reviews-section">
            <h2>Customer Reviews</h2>
            <div className="reviews-grid">
              {meal.reviews.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.user?.name?.charAt(0) || '👤'}
                      </div>
                      <div>
                        <h4>{review.user?.name || 'Anonymous'}</h4>
                        <div className="review-rating">
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealDetail;