const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // We fetch the user but explicitly ensure we have the ID available
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // ATTACH BOTH FOR MAXIMUM COMPATIBILITY
    req.user = user; 
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

module.exports = { protect };