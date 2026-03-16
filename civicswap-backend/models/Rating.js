const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    rater: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Ek transaction mein ek user sirf ek baar rate kar sake
ratingSchema.index({ transaction: 1, rater: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
