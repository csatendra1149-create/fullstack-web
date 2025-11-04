const Meal = require('../models/Meal');

// @desc    Get all meals
// @route   GET /api/meals
// @access  Public
exports.getAllMeals = async (req, res) => {
  try {
    const { 
      category, 
      foodType, 
      cuisine, 
      city, 
      search,
      page = 1, 
      limit = 12,
      sortBy = '-createdAt'
    } = req.query;

    const query = { isActive: true };
    
    // Filters
    if (category) query.category = category;
    if (foodType) query.foodType = foodType;
    if (cuisine) query.cuisine = cuisine;
    if (city) query['deliveryAreas.city'] = city;
    
    // Search
    if (search) {
      query.$text = { $search: search };
    }

    const meals = await Meal.find(query)
      .populate('homeKitchen', 'name kitchenDetails.kitchenName kitchenDetails.rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortBy);

    const count = await Meal.countDocuments(query);

    res.json({
      success: true,
      meals,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meals',
      error: error.message
    });
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Public
exports.getMealById = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id)
      .populate('homeKitchen', 'name kitchenDetails profileImage addresses')
      .populate('reviews.user', 'name profileImage');

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      meal
    });
  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meal',
      error: error.message
    });
  }
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private (Home Kitchen)
exports.createMeal = async (req, res) => {
  try {
    const mealData = {
      ...req.body,
      homeKitchen: req.user.id
    };

    const meal = await Meal.create(mealData);

    res.status(201).json({
      success: true,
      message: 'Meal created successfully',
      meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create meal',
      error: error.message
    });
  }
};

// @desc    Update meal
// @route   PUT /api/meals/:id
// @access  Private (Home Kitchen - Own meals only)
exports.updateMeal = async (req, res) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if user owns this meal
    if (meal.homeKitchen.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this meal'
      });
    }

    meal = await Meal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Meal updated successfully',
      meal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal',
      error: error.message
    });
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private (Home Kitchen - Own meals only)
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if user owns this meal
    if (meal.homeKitchen.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this meal'
      });
    }

    // Soft delete - just mark as inactive
    meal.isActive = false;
    await meal.save();

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal',
      error: error.message
    });
  }
};

// @desc    Add review to meal
// @route   POST /api/meals/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = meal.reviews.find(
      r => r.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this meal'
      });
    }

    const review = {
      user: req.user.id,
      rating: Number(rating),
      comment,
      images: images || []
    };

    meal.reviews.push(review);
    meal.calculateAverageRating();
    await meal.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// @desc    Get meals by kitchen
// @route   GET /api/meals/kitchen/:kitchenId
// @access  Public
exports.getMealsByKitchen = async (req, res) => {
  try {
    const meals = await Meal.find({
      homeKitchen: req.params.kitchenId,
      isActive: true
    }).sort('-createdAt');

    res.json({
      success: true,
      meals,
      count: meals.length
    });
  } catch (error) {
    console.error('Get kitchen meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch kitchen meals',
      error: error.message
    });
  }
};