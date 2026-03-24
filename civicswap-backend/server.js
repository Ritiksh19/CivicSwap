const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const keepAlive = require("./utils/keepAlive");

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: ["https://civicswap-frontend.vercel.app", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const itemRoutes = require("./routes/itemRoutes");
app.use("/api/items", itemRoutes);

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

const ratingRoutes = require("./routes/ratingRoutes");
app.use("/api/ratings", ratingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/", (req, res) => {
  res.json({ message: "CivicSwap API is running!" });
});

// Single app.listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  keepAlive();
});
