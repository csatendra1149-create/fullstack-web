const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['customer', 'home_kitchen', 'delivery_partner', 'admin'],
    default: 'customer'
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      required: true
    },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
    location: {
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
    isDefault: { type: Boolean, default: false }
  }],
  // For home kitchen users
  kitchenDetails: {
    kitchenName: String,
    description: String,
    specialties: [String],
    fssaiLicense: String,
    servingRadius: { type: Number, default: 5 }, // in kilometers
    operatingHours: {
      start: String,
      end: String
    },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
  },
  // For delivery partners
  deliveryDetails: {
    vehicleType: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'scooter', 'car']
    },
    vehicleNumber: String,
    drivingLicense: String,
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 },
    earnings: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  phoneVerificationOTP: String,
  otpExpiry: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  fcmToken: String, // For push notifications
  lastLogin: Date
}, {
  timestamps: true
});

// Index for geospatial queries
userSchema.index({ 'addresses.location': '2dsphere' });
userSchema.index({ 'deliveryDetails.currentLocation': '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.phoneVerificationOTP = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp;
};

module.exports = mongoose.model('User', userSchema);