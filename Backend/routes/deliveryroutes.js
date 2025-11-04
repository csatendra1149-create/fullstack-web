const express = require('express');
const router = express.Router();
const {
  getAvailableOrders,
  acceptDelivery,
  updateLocation,
  completeDelivery,
  getActiveDeliveries,
  getDeliveryHistory,
  getEarnings
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and delivery_partner role
router.use(protect);
router.use(authorize('delivery_partner', 'admin'));

// Delivery partner routes
router.get('/available-orders', getAvailableOrders);
router.post('/accept/:orderId', acceptDelivery);
router.put('/update-location', updateLocation);
router.post('/complete/:orderId', completeDelivery);
router.get('/active', getActiveDeliveries);
router.get('/history', getDeliveryHistory);
router.get('/earnings', getEarnings);

module.exports = router;