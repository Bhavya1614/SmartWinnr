
const express = require("express");

const {
  addReview,
  updateReview,
  deleteReview,
  getMyReviews
} = require("../controllers/reviewController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Customer adds a review
router.post(
  "/",
  protect,
  authorize("customer"),
  addReview
);

// Customer views own reviews
router.get(
  "/my-reviews",
  protect,
  authorize("customer"),
  getMyReviews
);

// Customer updates own review
router.put(
  "/:id",
  protect,
  authorize("customer"),
  updateReview
);

// Customer deletes own review
router.delete(
  "/:id",
  protect,
  authorize("customer"),
  deleteReview
);

module.exports = router;

