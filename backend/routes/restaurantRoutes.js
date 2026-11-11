
const express = require("express");

const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantReviews
} = require("../controllers/restaurantController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.get("/:id/reviews", getRestaurantReviews);

// Admin creates restaurant
router.post("/", protect, authorize("admin"), createRestaurant);

// Admin or assigned owner updates restaurant
router.put(
  "/:id",
  protect,
  authorize("admin", "owner"),
  updateRestaurant
);

// Admin deletes restaurant
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteRestaurant
);

module.exports = router;
