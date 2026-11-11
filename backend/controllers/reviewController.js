
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");

// Update restaurant average rating
const updateRestaurantRating = async (restaurantId) => {
  const result = await Review.aggregate([
    {
      $match: {
        restaurant: restaurantId
      }
    },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (result.length > 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Number(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

// Add review
const addReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Please provide restaurant, rating and comment."
      });
    }

    if (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5."
      });
    }

    if (!comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Review comment cannot be empty."
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found."
      });
    }

    const existingReview = await Review.findOne({
      customer: req.user._id,
      restaurant: restaurantId
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this restaurant."
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      restaurant: restaurantId,
      rating: Number(rating),
      comment: comment.trim()
    });

    await updateRestaurantRating(restaurant._id);

    res.status(201).json({
      success: true,
      message: "Review added successfully.",
      review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this restaurant."
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add review.",
      error: error.message
    });
  }
};

// Update own review
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own review."
      });
    }

    if (rating !== undefined) {
      if (!Number.isInteger(Number(rating)) ||
          Number(rating) < 1 ||
          Number(rating) > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5."
        });
      }

      review.rating = Number(rating);
    }

    if (comment !== undefined) {
      if (typeof comment !== "string" || !comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty."
        });
      }

      review.comment = comment.trim();
    }

    await review.save();
    await updateRestaurantRating(review.restaurant);

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update review.",
      error: error.message
    });
  }
};

// Delete own review
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found."
      });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own review."
      });
    }

    const restaurantId = review.restaurant;

    await review.deleteOne();
    await updateRestaurantRating(restaurantId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review.",
      error: error.message
    });
  }
};

// Get reviews written by logged-in customer
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      customer: req.user._id
    })
      .populate("restaurant", "name location cuisine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews.",
      error: error.message
    });
  }
};

module.exports = {
  addReview,
  updateReview,
  deleteReview,
  getMyReviews
};
