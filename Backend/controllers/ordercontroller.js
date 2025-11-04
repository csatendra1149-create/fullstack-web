const Order = require('../models/Order');
const Meal = require('../models/Meal');
const { sendOrderNotification } = require('../utils/sendSMS');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      pickupAddress,
      deliveryAddress,
      scheduledTime,
      deliveryInstructions,
      paymentMethod
    } = req.body;

    // Validate items and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const meal = await Meal.findById(item.meal);
      
      if (!meal || !meal.isActive) {
        return res.status(400).json({
          success: false,
          message: `Meal ${item.meal} is not available`
        });
      }

      orderItems.push({
        meal: meal._id,
        name: meal.name,
        quantity: item.quantity,
        price: meal.price,
        specialInstructions: item.specialInstructions
      });

      subtotal += meal.price * item.quantity;

      // Update meal availability
      await meal.updateAvailability(scheduledTime.timeSlot, item.quantity);
    }

    // Calculate pricing
    const deliveryFee = 50; // Base delivery fee
    const tax = subtotal * 0.13; // 13% VAT
    const total = subtotal + deliveryFee + tax;

    // Get home kitchen from first item
    const firstMeal = await Meal.findById(items[0].meal);

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      homeKitchen: firstMeal.homeKitchen,
      items: orderItems,
      pickupAddress,
      deliveryAddress,
      scheduledTime,
      deliveryInstructions,
      pricing: {
        subtotal,
        deliveryFee,
        tax,
        total
      },
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cash' ? 'pending' : 'pending'
      }
    });

    // Send notifications
    await sendOrderNotification(req.user.phone, order.orderNumber, 'pending');

    // Emit socket event
    if (global.io) {
      global.io.to(`kitchen_${firstMeal.homeKitchen}`).emit('new_order', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { customer: req.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('homeKitchen', 'name kitchenDetails.kitchenName')
      .populate('deliveryPartner', 'name phone')
      .populate('items.meal', 'name images')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('homeKitchen', 'name phone kitchenDetails')
      .populate('deliveryPartner', 'name phone deliveryDetails')
      .populate('items.meal', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is authorized to view this order
    const isAuthorized = 
      order.customer._id.toString() === req.user.id ||
      order.homeKitchen._id.toString() === req.user.id ||
      (order.deliveryPartner && order.deliveryPartner._id.toString() === req.user.id) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update status
    await order.updateStatus(status, note, req.user.id);

    // Send notification
    const customer = await User.findById(order.customer);
    await sendOrderNotification(customer.phone, order.orderNumber, status);

    // Emit socket event
    if (global.io) {
      global.io.to(`order_${order._id}`).emit('status_update', {
        orderId: order._id,
        status,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason;
    order.cancelledBy = req.user.id;
    order.cancelledAt = Date.now();
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// @desc    Rate order
// @route   POST /api/orders/:id/rate
// @access  Private
exports.rateOrder = async (req, res) => {
  try {
    const { food, delivery, overall, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate delivered orders'
      });
    }

    order.rating = {
      food: Number(food),
      delivery: Number(delivery),
      overall: Number(overall),
      comment,
      createdAt: Date.now()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Order rated successfully',
      rating: order.rating
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate order',
      error: error.message
    });
  }
};

// @desc    Get kitchen orders
// @route   GET /api/orders/kitchen
// @access  Private (Home Kitchen)
exports.getKitchenOrders = async (req, res) => {
  try {
    const { status, date } = req.query;
    
    const query = { homeKitchen: req.user.id };
    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('deliveryPartner', 'name phone')
      .sort('-createdAt');

    res.json({
      success: true,
      orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get kitchen orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kitchen orders',
      error: error.message
    });
  }
};