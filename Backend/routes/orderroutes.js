const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  rateOrder,
  getKitchenOrders
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.post('/:id/rate', rateOrder);

// Kitchen routes
router.get('/kitchen/orders', authorize('home_kitchen', 'admin'), getKitchenOrders);

// Update order status (Kitchen and Delivery Partner)
router.put('/:id/status', authorize('home_kitchen', 'delivery_partner', 'admin'), updateOrderStatus);

module.exports = router;