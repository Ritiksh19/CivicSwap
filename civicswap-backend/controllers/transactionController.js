const Transaction = require("../models/Transaction");
const Item = require("../models/Item");

// ─────────────────────────────────────────
// @route   POST /api/transactions
// @access  Private
// ─────────────────────────────────────────
const createTransaction = async (req, res) => {
  try {
    const { itemId, startDate, endDate, message } = req.body;

    // Item dhundo
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item nahi mila" });
    }

    // Apna item borrow nahi kar sakte
    if (item.owner.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Apna item borrow nahi kar sakte" });
    }

    // Item available hai?
    if (item.status !== "AVAILABLE") {
      return res.status(400).json({ message: "Item abhi available nahi hai" });
    }

    // Overlap check - koi aur approved transaction hai?
    const overlap = await Transaction.findOne({
      item: itemId,
      status: "APPROVED",
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlap) {
      return res
        .status(400)
        .json({ message: "In dates pe item already booked hai" });
    }

    // Transaction banao
    const transaction = await Transaction.create({
      item: itemId,
      borrower: req.user._id,
      lender: item.owner,
      startDate,
      endDate,
      message,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/transactions/my
// @access  Private
// ─────────────────────────────────────────
const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ borrower: req.user._id }, { lender: req.user._id }],
    })
      .populate("item", "title photo category")
      .populate("borrower", "name avatar reputationScore")
      .populate("lender", "name avatar reputationScore")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/transactions/requests
// @access  Private (lender ke liye)
// ─────────────────────────────────────────
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Transaction.find({
      lender: req.user._id,
      status: "PENDING",
    })
      .populate("item", "title photo category")
      .populate("borrower", "name avatar reputationScore")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/transactions/:id/approve
// @access  Private (sirf lender)
// ─────────────────────────────────────────
const approveTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction nahi mili" });
    }

    // Sirf lender approve kar sakta hai
    if (transaction.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    // Sirf PENDING approve ho sakti hai
    if (transaction.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Yeh transaction approve nahi ho sakti" });
    }

    transaction.status = "APPROVED";
    transaction.approvedAt = new Date();
    await transaction.save();

    // Item status update karo
    await Item.findByIdAndUpdate(transaction.item, { status: "ON_LOAN" });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/transactions/:id/reject
// @access  Private (sirf lender)
// ─────────────────────────────────────────
const rejectTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction nahi mili" });
    }

    if (transaction.lender.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    if (transaction.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "Yeh transaction reject nahi ho sakti" });
    }

    transaction.status = "REJECTED";
    await transaction.save();

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/transactions/:id/return
// @access  Private (borrower ya lender)
// ─────────────────────────────────────────
const returnTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction nahi mili" });
    }

    // Sirf borrower ya lender return mark kar sakta hai
    const isBorrower =
      transaction.borrower.toString() === req.user._id.toString();
    const isLender = transaction.lender.toString() === req.user._id.toString();

    if (!isBorrower && !isLender) {
      return res.status(401).json({ message: "Permission nahi hai" });
    }

    if (transaction.status !== "APPROVED" && transaction.status !== "ON_LOAN") {
      return res
        .status(400)
        .json({ message: "Yeh transaction return nahi ho sakti" });
    }

    transaction.status = "RETURNED";
    transaction.returnedAt = new Date();
    await transaction.save();

    // Item wapas AVAILABLE karo
    await Item.findByIdAndUpdate(transaction.item, { status: "AVAILABLE" });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTransaction,
  getMyTransactions,
  getIncomingRequests,
  approveTransaction,
  rejectTransaction,
  returnTransaction,
};
