const express = require('express');
const { createVehicle, getVehicles, searchVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);
router.put('/:id', protect, updateVehicle);

// NEW: Requires both protect AND admin middleware
router.delete('/:id', protect, admin, deleteVehicle);

module.exports = router;