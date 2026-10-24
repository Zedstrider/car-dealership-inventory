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

module.exports = { createVehicle };