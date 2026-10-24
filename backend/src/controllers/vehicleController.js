const Vehicle = require('../models/Vehicle');

const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await vehicle.save();
    res.status(201).json(savedVehicle);
  } catch (error) {
    res.status(400).json({ message: 'Invalid vehicle data', error: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const searchVehicles = async (req, res) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    let query = {};

    // Use regex for case-insensitive partial matching
    if (make) query.make = new RegExp(make, 'i');
    if (model) query.model = new RegExp(model, 'i');
    if (category) query.category = new RegExp(category, 'i');
    
    // Handle price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(query);
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createVehicle, getVehicles, searchVehicles };