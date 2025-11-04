const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get available orders for delivery
// @route   GET /api/delivery/available-orders
// @access  Private (Delivery Partner)
exports.getAvailableOrders = async (req, res) => {
  try {
    // Get orders that are ready for pickup and not assigned
    const orders = await Order.find({
      status: 'ready_for_pickup',
      deliveryPartner: null
    })
      .populate('customer', 'name phone')
      .populate('homeKitchen', 'name phone addresses')
      .populate('items.meal', 'name')
      .sort('scheduledTime.date');

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available orders',
      error: error.message
    });
  }
};

// @desc    Accept delivery
// @route   POST /api/delivery/accept/:orderId
// @access  Private (Delivery Partner)
exports.acceptDelivery = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryPartner) {
      return res.status(400).json({
        success: false,
        message: 'Order already assigned to another delivery partner'
      });
    }

    // Assign delivery partner
    order.deliveryPartner = req.user.id;
    await order.updateStatus('assigned', 'Delivery partner assigned', req.user.id);

    // Update delivery partner status
    const deliveryPartner = await User.findById(req.user.id);
    deliveryPartner.deliveryDetails.isAvailable = false;
    await deliveryPartner.save();

    // Emit socket event
    if (global.io) {
      global.io.to(`order_${order._id}`).emit('delivery_assigned', {
        orderId: order._id,
        deliveryPartner: {
          name: req.user.name,
          phone: req.user.phone
        }
      });
    }

    res.json({
      success: true,
      message: 'Delivery accepted successfully',
      order
    });
  } catch (error) {
    console.error('Accept delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept delivery',
      error: error.message
    });
  }
};

// @desc    Update delivery location
// @route   PUT /api/delivery/update-location
// @access  Private (Delivery Partner)
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const deliveryPartner = await User.findById(req.user.id);
    
    deliveryPartner.deliveryDetails.currentLocation = {
      type: 'Point',
      coordinates: [longitude, latitude]
    };
    
    await deliveryPartner.save();

    // Find active orders for this delivery partner
    const activeOrders = await Order.find({
      deliveryPartner: req.user.id,
      status: { $in: ['picked_up', 'out_for_delivery'] }
    });

    // Emit location update for each active order
    if (global.io) {
      activeOrders.forEach(order => {
        global.io.to(`order_${order._id}`).emit('location_update', {
          latitude,
          longitude,
          timestamp: new Date()
        });
      });
    }

    res.json({
      success: true,
      message: 'Location updated successfully'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// @desc    Complete delivery
// @route   POST /api/delivery/complete/:orderId
// @access  Private (Delivery Partner)
exports.completeDelivery = async (req, res) => {
  try {
    const { otp, image } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.deliveryPartner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark order as delivered
    order.actualDeliveryTime = Date.now();
    await order.updateStatus('delivered', 'Order delivered successfully', req.user.id);

    // Update delivery partner earnings
    const deliveryPartner = await User.findById(req.user.id);
    deliveryPartner.deliveryDetails.totalDeliveries += 1;
    deliveryPartner.deliveryDetails.earnings += order.pricing.deliveryFee * 0.7; // 70% of delivery fee
    deliveryPartner.deliveryDetails.isAvailable = true;
    await deliveryPartner.save();

    // Update home kitchen stats
    const kitchen = await User.findById(order.homeKitchen);
    kitchen.kitchenDetails.totalOrders += 1;
    await kitchen.save();

    res.json({
      success: true,
      message: 'Delivery completed successfully',
      earnings: order.pricing.deliveryFee * 0.7
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete delivery',
      error: error.message
    });
  }
};

// @desc    Get active deliveries
// @route   GET /api/delivery/active
// @access  Private (Delivery Partner)
exports.getActiveDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      deliveryPartner: req.user.id,
      status: { $in: ['assigned', 'picked_up', 'out_for_delivery'] }
    })
      .populate('customer', 'name phone')
      .populate('homeKitchen', 'name phone addresses')
      .populate('items.meal', 'name')
      .sort('scheduledTime.date');

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get active deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active deliveries',
      error: error.message
    });
  }
};

// @desc    Get delivery history
// @route   GET /api/delivery/history
// @access  Private (Delivery Partner)
exports.getDeliveryHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    
    const query = {
      deliveryPartner: req.user.id,
      status: 'delivered'
    };

    if (startDate && endDate) {
      query.actualDeliveryTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name')
      .populate('homeKitchen', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-actualDeliveryTime');

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get delivery history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery history',
      error: error.message
    });
  }
};

// @desc    Get earnings
// @route   GET /api/delivery/earnings
// @access  Private (Delivery Partner)
exports.getEarnings = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const orders = await Order.find({
      deliveryPartner: req.user.id,
      status: 'delivered',
      actualDeliveryTime: { $gte: startDate }
    });

    const totalEarnings = orders.reduce((sum, order) => 
      sum + (order.pricing.deliveryFee * 0.7), 0
    );

    const deliveryPartner = await User.findById(req.user.id);

    res.json({
      success: true,
      earnings: {
        period,
        totalEarnings: totalEarnings.toFixed(2),
        totalDeliveries: orders.length,
        lifetimeEarnings: deliveryPartner.deliveryDetails.earnings.toFixed(2),
        lifetimeDeliveries: deliveryPartner.deliveryDetails.totalDeliveries
      }
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch earnings',
      error: error.message
    });
  }
};