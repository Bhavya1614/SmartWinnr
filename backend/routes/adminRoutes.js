
const express = require("express");

const {
  createOwner,
  assignOwner,
  getAllUsers,
  deleteUser,
  getAllReviews,
  removeReview,
  getDashboardStats
} = require("../controllers/adminController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// All admin routes require admin authentication
router.use(protect, authorize("admin"));

// Dashboard statistics
router.get("/dashboard", getDashboardStats);

// Manage users
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);

// Create restaurant owner
router.post("/owners", createOwner);

// Assign owner to restaurant
router.put("/restaurants/:restaurantId/assign-owner", assignOwner);

// Manage reviews
router.get("/reviews", getAllReviews);
router.delete("/reviews/:reviewId", removeReview);

module.exports = router;
