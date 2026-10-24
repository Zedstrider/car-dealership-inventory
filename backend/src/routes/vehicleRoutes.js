const express = require('express');
const { 
  createVehicle, 
  getVehicles, 
  searchVehicles, 
  updateVehicle, 
  deleteVehicle,
  purchaseVehicle // NEW: Import the controller
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);

// NEW: Purchase route (standard users can access this)
router.post('/:id/purchase', protect, purchaseVehicle);

module.exports = router;