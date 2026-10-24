const jwt = require('jsonwebtoken');
const User = require('../models/User'); // NEW: Import User model

const protect = (req, res, next) => {
  // ... (keep your existing protect logic here)
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testsecret');
      req.user = decoded; 
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// NEW: Admin authorization check
const admin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Not authorized as an admin' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { protect, admin }; // Export both