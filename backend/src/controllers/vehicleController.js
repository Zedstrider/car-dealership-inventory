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

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // { new: true } ensures we get the updated document back
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, req.body, { 
      new: true,
      runValidators: true // Ensures Mongoose schema validation rules are applied
    });

    if (!updatedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const purchaseVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.quantity <= 0) {
      return res.status(400).json({ message: 'Vehicle is out of stock' });
    }

    // Decrease quantity and save
    vehicle.quantity -= 1;
    await vehicle.save();

    res.status(200).json({ 
      message: 'Vehicle purchased successfully', 
      vehicle 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const restockVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Must provide a valid quantity to restock' });
    }

    vehicle.quantity += Number(quantity);
    await vehicle.save();

    res.status(200).json({ 
      message: 'Vehicle restocked successfully', 
      vehicle 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update the exports to include restockVehicle
module.exports = { 
  createVehicle, 
  getVehicles, 
  searchVehicles, 
  updateVehicle, 
  deleteVehicle, 
  purchaseVehicle,
  restockVehicle
};