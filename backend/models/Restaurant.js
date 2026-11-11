
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true
    },

    cuisine: {
      type: [String],
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    totalReviews: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

restaurantSchema.index({
  name: "text",
  location: "text",
  cuisine: "text"
});

module.exports = mongoose.model("Restaurant", restaurantSchema);
