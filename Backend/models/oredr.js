const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  homeKitchen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    meal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meal',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    specialInstructions: String
  }],
  pickupAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    pincode: String,
    landmark: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    contactName: String,
    contactPhone: String
  },
  deliveryAddress: {
    addressLine1: String,
    addressLine2: String,
    city: String,
    pincode: String,
    landmark: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    contactName: String,
    contactPhone: String
  },
  scheduledTime: {
    date: Date,
    timeSlot: {
      startTime: String,
      endTime: String
    }
  },
  status: {
    type: String,
    enum: [
      'pending',           // Order placed
      'confirmed',         // Home kitchen confirmed
      'preparing',         // Meal being prepared
      'ready_for_pickup',  // Ready for delivery partner
      'assigned',          // Delivery partner assigned
      'picked_up',         // Picked up from kitchen
      'out_for_delivery',  // On the way to customer
      'delivered',         // Successfully delivered
      'cancelled',         // Order cancelled
      'refunded'          // Payment refunded
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  rating: {
    food: Number,
    delivery: Number,
    overall: Number,
    comment: String,
    createdAt: Date
  },
  trackingUpdates: [{
    message: String,
    timestamp: { type: Date, default: Date.now },
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    }
  }],
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  deliveryInstructions: String,
  isScheduled: {
    type: Boolean,
    default: false
  },
  promoCode: String,
  notes: String
}, {
  timestamps: true
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const timestamp = date.getTime().toString().slice(-8);
    const random = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `HT${timestamp}${random}`;
  }
  next();
});

// Add status to history
orderSchema.methods.updateStatus = async function(status, note, updatedBy) {
  this.status = status;
  this.statusHistory.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
  
  // Emit socket event for real-time updates
  if (global.io) {
    global.io.to(`order_${this._id}`).emit('order_status_update', {
      orderId: this._id,
      status,
      timestamp: new Date()
    });
  }
  
  await this.save();
};

// Calculate delivery fee based on distance
orderSchema.methods.calculateDeliveryFee = function(distance) {
  // Base fee + per km charge
  const baseFee = 30;
  const perKmCharge = 10;
  this.pricing.deliveryFee = baseFee + (distance * perKmCharge);
  this.pricing.total = this.pricing.subtotal + this.pricing.deliveryFee + 
                       this.pricing.tax - this.pricing.discount;
};

// Index for efficient queries
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ homeKitchen: 1, status: 1 });
orderSchema.index({ deliveryPartner: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'scheduledTime.date': 1 });

module.exports = mongoose.model('Order', orderSchema);