const Rating = require("../models/Rating");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// ─────────────────────────────────────────
// @route   POST /api/ratings
// @access  Private
// ─────────────────────────────────────────
const submitRating = async (req, res) => {
  try {
    const { transactionId, stars, feedback } = req.body;

    // Transaction dhundo
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction nahi mili" });
    }

    // Sirf RETURNED ya CLOSED transaction rate ho sakti hai
    if (transaction.status !== "RETURNED" && transaction.status !== "CLOSED") {
      return res.status(400).json({ message: "Pehle item return karo" });
    }

    // Sirf borrower ya lender rate kar sakta hai
    const isBorrower =
      transaction.borrower.toString() === req.user._id.toString();
    const isLender = transaction.lender.toString() === req.user._id.toString();

    if (!isBorrower && !isLender) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    // Ratee kaun hai
    const rateeId = isBorrower ? transaction.lender : transaction.borrower;

    // Already rate kiya?
    const alreadyRated = await Rating.findOne({
      transaction: transactionId,
      rater: req.user._id,
    });

    if (alreadyRated) {
      return res
        .status(400)
        .json({ message: "Aap pehle hi rate kar chuke ho" });
    }

    // Rating banao
    const rating = await Rating.create({
      transaction: transactionId,
      rater: req.user._id,
      ratee: rateeId,
      stars,
      feedback,
    });

    // Ratee ka reputation score update karo
    const allRatings = await Rating.find({ ratee: rateeId });
    const totalStars = allRatings.reduce((sum, r) => sum + r.stars, 0);
    const avgScore = totalStars / allRatings.length;

    await User.findByIdAndUpdate(rateeId, {
      reputationScore: Math.round(avgScore * 10) / 10,
      totalRatings: allRatings.length,
    });

    // Dono ne rate kar diya toh transaction CLOSED karo
    const bothRated = await Rating.find({ transaction: transactionId });
    if (bothRated.length === 2) {
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "CLOSED",
        closedAt: new Date(),
      });
    }

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/ratings/user/:userId
// @access  Private
// ─────────────────────────────────────────
const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate("rater", "name avatar")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitRating, getUserRatings };
