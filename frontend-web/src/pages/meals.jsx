import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mealAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { FiSearch, FiFilter } from 'react-icons/fi';
import Loading from '../components/common/Loading';
import './Meals.css';

const Meals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    foodType: '',
    cuisine: ''
  });

  useEffect(() => {
    fetchMeals();
  }, [filters]);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const response = await mealAPI.getAllMeals(filters);
      if (response.success) {
        setMeals(response.meals);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      foodType: '',
      cuisine: ''
    });
  };

  if (loading) {
    return <Loading message="Loading delicious meals..." />;
  }

  return (
    <div className="meals-page">
      <div className="container">
        <div className="meals-header">
          <h1 className="page-title">Browse Meals</h1>
          <p className="page-subtitle">Fresh home-cooked meals available today</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search meals..."
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
              <option value="dessert">Dessert</option>
            </select>

            <select
              name="foodType"
              value={filters.foodType}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="egg">Egg</option>
            </select>

            <select
              name="cuisine"
              value={filters.cuisine}
              onChange={handleFilterChange}
              className="filter-select"
            >
              <option value="">All Cuisines</option>
              <option value="nepali">Nepali</option>
              <option value="indian">Indian</option>
              <option value="chinese">Chinese</option>
              <option value="continental">Continental</option>
            </select>

            {(filters.search || filters.category || filters.foodType || filters.cuisine) && (
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Meals Grid */}
        {meals.length === 0 ? (
          <div className="no-meals">
            <span className="no-meals-icon">🍽️</span>
            <h3>No meals found</h3>
            <p>Try adjusting your filters or check back later for new meals!</p>
          </div>
        ) : (
          <>
            <div className="meals-count">
              Showing {meals.length} meal{meals.length !== 1 ? 's' : ''}
            </div>
            <div className="meals-grid">
              {meals.map(meal => (
                <Link to={`/meals/${meal._id}`} key={meal._id} className="meal-card">
                  <div className="meal-image">
                    {meal.images && meal.images.length > 0 ? (
                      <img src={meal.images[0].url} alt={meal.name} />
                    ) : (
                      <div className="placeholder-image">🍛</div>
                    )}
                    <div className="meal-badges">
                      <span className={`badge badge-${meal.foodType}`}>
                        {meal.foodType === 'veg' ? '🥬' : meal.foodType === 'non-veg' ? '🍗' : '🥚'} 
                        {meal.foodType}
                      </span>
                    </div>
                  </div>
                  
                  <div className="meal-content">
                    <h3 className="meal-name">{meal.name}</h3>
                    <p className="meal-description">{meal.description}</p>
                    
                    <div className="meal-info">
                      <span className="meal-category">📂 {meal.category}</span>
                      <span className="meal-cuisine">🌍 {meal.cuisine}</span>
                    </div>

                    <div className="meal-footer">
                      <div className="meal-price">
                        <span className="price">{formatCurrency(meal.price)}</span>
                        <span className="serving">/ {meal.servingSize}</span>
                      </div>
                      <div className="meal-rating">
                        ⭐ {meal.rating.average > 0 ? meal.rating.average : 'New'}
                        {meal.rating.count > 0 && (
                          <span className="rating-count">({meal.rating.count})</span>
                        )}
                      </div>
                    </div>

                    <div className="meal-kitchen">
                      <span>👩‍🍳 {meal.homeKitchen?.kitchenDetails?.kitchenName || meal.homeKitchen?.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Meals;