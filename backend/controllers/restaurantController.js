
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

// Get all restaurants with search and filters
const getRestaurants = async (req, res) => {
  try {
    const { search, location, cuisine } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (cuisine) {
      filter.cuisine = { $regex: cuisine, $options: "i" };
    }

    const restaurants = await Restaurant.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants.",
      error: error.message
    });
  }
};

// Get one restaurant
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate("owner", "name email");

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    res.status(200).json({
      success: true,
      restaurant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant.",
      error: error.message
    });
  }
};

// Create restaurant (Admin only)
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      address,
      cuisine,
      phone,
      email,
      owner
    } = req.body;

    if (
      !name ||
      !description ||
      !location ||
      !address ||
      !cuisine ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required restaurant details."
      });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      location,
      address,
      cuisine: Array.isArray(cuisine) ? cuisine : [cuisine],
      phone,
      email,
      owner: owner || null
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      restaurant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create restaurant.",
      error: error.message
    });
  }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    // Owners can update only their assigned restaurant
    if (
      req.user.role === "owner" &&
      restaurant.owner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update another owner's restaurant."
      });
    }

    const allowedFields = [
      "name",
      "description",
      "location",
      "address",
      "cuisine",
      "phone",
      "email",
      "image"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    });

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully.",
      restaurant
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant.",
      error: error.message
    });
  }
};

// Delete restaurant (Admin only) - soft delete
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    restaurant.isActive = false;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant deactivated successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete restaurant.",
      error: error.message
    });
  }
};

// View restaurant reviews and rating summary
const getRestaurantReviews = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    const reviews = await Review.find({
      restaurant: restaurant._id
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    const summary = await Review.aggregate([
      { $match: { restaurant: restaurant._id } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      averageRating: restaurant.averageRating,
      totalReviews: reviews.length,
      ratingDistribution: summary,
      reviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews.",
      error: error.message
    });
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantReviews
};