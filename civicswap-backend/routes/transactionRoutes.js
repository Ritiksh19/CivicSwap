const express = require("express");
const router = express.Router();
const {
  createTransaction,
  getMyTransactions,
  getIncomingRequests,
  approveTransaction,
  rejectTransaction,
  returnTransaction,
} = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTransaction);
router.get("/my", protect, getMyTransactions);
router.get("/requests", protect, getIncomingRequests);
router.put("/:id/approve", protect, approveTransaction);
router.put("/:id/reject", protect, rejectTransaction);
router.put("/:id/return", protect, returnTransaction);

module.exports = router;
