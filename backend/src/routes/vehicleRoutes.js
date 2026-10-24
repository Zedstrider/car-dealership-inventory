const express = require('express');
const { createVehicle, getVehicles, searchVehicles } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);

// NEW: Search route must come before dynamic /:id routes
router.get('/search', protect, searchVehicles);

module.exports = router;