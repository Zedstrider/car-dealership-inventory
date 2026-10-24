const express = require('express');
const { createVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// The "protect" middleware runs first to check the token
router.post('/', protect, createVehicle);

module.exports = router;