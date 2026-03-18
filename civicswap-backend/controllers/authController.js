const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Token generate karne ka helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ─────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, longitude, latitude } = req.body;

    // Email already exist karta hai?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already registered hai" });
    }

    // User banao
    const user = await User.create({
      name,
      email,
      password,
      location: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    });

    // Token bhejo
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      reputationScore: user.reputationScore,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundo
    const user = await User.findOne({ email });

    // Password check karo
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        reputationScore: user.reputationScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Email ya password galat hai" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   GET /api/auth/profile
// @access  Private (token chahiye)
// ─────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────
// @route   PUT /api/auth/profile
// @access  Private (token chahiye)
// ─────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.avatar = req.body.avatar || user.avatar;

    // Location update
    if (req.body.longitude && req.body.latitude) {
      user.location = {
        type: "Point",
        coordinates: [req.body.longitude, req.body.latitude],
      };
    }

    // Password change
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      reputationScore: updatedUser.reputationScore,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
