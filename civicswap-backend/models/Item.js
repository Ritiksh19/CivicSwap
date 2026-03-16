const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Tools",
        "Books",
        "Kitchenware",
        "Electronics",
        "Sports",
        "Clothing",
        "Other",
      ],
      required: true,
    },
    photo: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_LOAN", "UNAVAILABLE"],
      default: "AVAILABLE",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

// Geo index - nearby items search ke liye
itemSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Item", itemSchema);
