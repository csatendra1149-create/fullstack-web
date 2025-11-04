const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  homeKitchen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide meal name'],
    trim: true,
    maxlength: [100, 'Meal name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide meal description'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snacks', 'dessert'],
    required: true
  },
  cuisine: {
    type: String,
    enum: ['nepali', 'indian', 'chinese', 'continental', 'mixed'],
    default: 'nepali'
  },
  foodType: {
    type: String,
    enum: ['veg', 'non-veg', 'vegan', 'egg'],
    required: true
  },
  images: [{
    url: String,
    public_id: String
  }],
  price: {
    type: Number,
    required: [true, 'Please provide meal price'],
    min: [0, 'Price cannot be negative']
  },
  servingSize: {
    type: String,
    required: true,
    default: '1 person'
  },
  preparationTime: {
    type: Number, // in minutes
    required: true,
    default: 30
  },
  ingredients: [String],
  allergens: [String],
  spiceLevel: {
    type: String,
    enum: ['mild', 'medium', 'hot', 'extra-hot'],
    default: 'medium'
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlots: [{
      startTime: String, // "11:00"
      endTime: String,   // "14:00"
      quantity: Number,
      availableQuantity: Number
    }]
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  deliveryAreas: [{
    city: String,
    areas: [String]
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: { type: Number, required: true },
    comment: String,
    images: [String],
    createdAt: { type: Date, default: Date.now }
  }],
  totalOrders: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String] // homemade, traditional, special, etc.
}, {
  timestamps: true
});

// Index for searching
mealSchema.index({ name: 'text', description: 'text', tags: 'text' });
mealSchema.index({ homeKitchen: 1, 'availability.date': 1 });
mealSchema.index({ category: 1, foodType: 1, isActive: 1 });

// Calculate average rating
mealSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = (sum / this.reviews.length).toFixed(1);
    this.rating.count = this.reviews.length;
  }
};

// Update available quantity
mealSchema.methods.updateAvailability = async function(timeSlot, quantity) {
  const slot = this.availability.timeSlots.find(
    s => s.startTime === timeSlot.startTime && s.endTime === timeSlot.endTime
  );
  
  if (slot) {
    slot.availableQuantity -= quantity;
    if (slot.availableQuantity <= 0) {
      slot.availableQuantity = 0;
    }
  }
  
  await this.save();
};

module.exports = mongoose.model('Meal', mealSchema);