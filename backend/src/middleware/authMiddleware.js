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

// NEW: Stateless Admin authorization check
const admin = (req, res, next) => {
  // We trust the JWT payload assigned in the 'protect' middleware
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin }; // Export both