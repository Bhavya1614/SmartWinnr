
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

// Create restaurant owner account
const createOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists."
      });
    }

    const owner = await User.create({
      name,
      email,
      password,
      role: "owner"
    });

    res.status(201).json({
      success: true,
      message: "Restaurant owner created successfully.",
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create owner.",
      error: error.message
    });
  }
};

// Assign owner to restaurant
const assignOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;

    const owner = await User.findOne({
      _id: ownerId,
      role: "owner"
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Restaurant owner not found."
      });
    }

    const restaurant = await Restaurant.findById(
      req.params.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    if (restaurant.owner &&
        restaurant.owner.toString() !== ownerId) {
      await User.updateOne(
        { _id: restaurant.owner },
        { $unset: { assignedRestaurant: 1 } }
      );
    }

    restaurant.owner = owner._id;
    await restaurant.save();

    await User.findByIdAndUpdate(ownerId, {
      assignedRestaurant: restaurant._id
    });

    res.status(200).json({
      success: true,
      message: "Owner assigned successfully.",
      restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign owner.",
      error: error.message
    });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message
    });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account."
      });
    }

    if (user.role === "owner") {
      await Restaurant.updateMany(
        { owner: user._id },
        { $set: { owner: null } }
      );
    }

    await Review.deleteMany({ customer: user._id });
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message
    });
  }
};

// NEW: Get all customer reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("restaurant", "name location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
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

// Remove inappropriate review
const removeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    const restaurantId = review.restaurant;

    await review.deleteOne();

    const result = await Review.aggregate([
      { $match: { restaurant: restaurantId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: result.length
        ? Number(result[0].averageRating.toFixed(1))
        : 0,
      totalReviews: result.length
        ? result[0].totalReviews
        : 0
    });

    res.status(200).json({
      success: true,
      message: "Review removed successfully."
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove review.",
      error: error.message
    });
  }
};

// Admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({
      role: "customer"
    });
    const totalOwners = await User.countDocuments({
      role: "owner"
    });
    const totalRestaurants = await Restaurant.countDocuments({
      isActive: true
    });
    const totalReviews = await Review.countDocuments();

    const ratingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const averagePlatformRating = ratingResult.length
      ? Number(ratingResult[0].averageRating.toFixed(1))
      : 0;

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalCustomers,
        totalOwners,
        totalRestaurants,
        totalReviews,
        averagePlatformRating
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics.",
      error: error.message
    });
  }
};

module.exports = {
  createOwner,
  assignOwner,
  getAllUsers,
  deleteUser,
  getAllReviews,
  removeReview,
  getDashboardStats
};
