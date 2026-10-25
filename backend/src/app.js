const express = require('express');
const cors = require('cors'); // NEW: Import cors
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

app.use(cors()); // NEW: Enable CORS for all routes
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

module.exports = app;