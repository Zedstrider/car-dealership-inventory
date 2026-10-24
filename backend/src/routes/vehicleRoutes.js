const express = require('express');
const { createVehicle, getVehicles, searchVehicles, updateVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);

// NEW: Update route using dynamic :id
router.put('/:id', protect, updateVehicle);

module.exports = router;