const express = require('express');
const router = express.Router();
const {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  addReview,
  getMealsByKitchen
} = require('../controllers/mealController');
const { protect, authorize, requireKitchenVerification } = require('../middleware/auth');

// Public routes
router.get('/', getAllMeals);
router.get('/kitchen/:kitchenId', getMealsByKitchen);
router.get('/:id', getMealById);

// Protected routes - require authentication
router.post('/:id/review', protect, addReview);

// Home kitchen only routes
router.post('/', protect, authorize('home_kitchen', 'admin'), requireKitchenVerification, createMeal);
router.put('/:id', protect, authorize('home_kitchen', 'admin'), updateMeal);
router.delete('/:id', protect, authorize('home_kitchen', 'admin'), deleteMeal);

module.exports = router;