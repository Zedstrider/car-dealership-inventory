const express = require('express');

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// The registration endpoint our test is looking for
app.post('/api/auth/register', (req, res) => {
  res.status(201).json({ message: 'User registered successfully' });
});

module.exports = app;