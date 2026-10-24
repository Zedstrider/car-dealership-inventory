const express = require('express');
const { 
  createVehicle, 
  getVehicles, 
  searchVehicles, 
  updateVehicle, 
  deleteVehicle,
  purchaseVehicle,
  restockVehicle // Import the new controller
} = require('../controllers/vehicleController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.get('/search', protect, searchVehicles);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, admin, deleteVehicle);
router.post('/:id/purchase', protect, purchaseVehicle);

// NEW: Restock route requires both protect AND admin middleware
router.post('/:id/restock', protect, admin, restockVehicle);

module.exports = router;