
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

// One customer can review a restaurant only once
reviewSchema.index(
  { customer: 1, restaurant: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
