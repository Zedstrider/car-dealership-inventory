const express = require('express');
const { createVehicle, getVehicles } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Both routes are protected by our JWT middleware
router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);

module.exports = router;