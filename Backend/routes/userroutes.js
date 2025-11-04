const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes - All require authentication
router.use(protect);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Address routes
router.post('/address', addAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);
router.put('/address/:id/default', setDefaultAddress);

// Admin only routes
router.get('/', authorize('admin'), getAllUsers);

module.exports = router;