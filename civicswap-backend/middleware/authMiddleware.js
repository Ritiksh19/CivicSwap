const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Header mein token check karo
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token extract karo
      token = req.headers.authorization.split(" ")[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User find karo (password chhod ke)
      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res
        .status(401)
        .json({ message: "Token invalid hai, access nahi milega" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Token nahi hai, access nahi milega" });
  }
};

module.exports = { protect };
