const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    default: 'Nepal'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  launchDate: {
    type: Date
  },
  areas: [{
    name: String,
    pincode: String,
    isServiceable: {
      type: Boolean,
      default: true
    }
  }],
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  stats: {
    totalUsers: { type: Number, default: 0 },
    totalKitchens: { type: Number, default: 0 },
    totalDeliveryPartners: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for geospatial queries
citySchema.index({ coordinates: '2dsphere' });
citySchema.index({ name: 1, isActive: 1 });

module.exports = mongoose.model('City', citySchema);