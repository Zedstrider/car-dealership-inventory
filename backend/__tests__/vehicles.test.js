const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const Vehicle = require('../src/models/Vehicle');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a user and token to access the protected route
  const user = await User.create({ email: 'admin@dealership.com', password: 'password123' });
  token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/vehicles', () => {
  it('should create a new vehicle when authenticated', async () => {
    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 25000,
        quantity: 5
      });
      
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.make).toBe('Toyota');
  });
});

describe('GET /api/vehicles', () => {
  it('should fetch all available vehicles when authenticated', async () => {
    // 1. Manually seed the database with a couple of vehicles
    await Vehicle.create([
      { make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 2 },
      { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 35000, quantity: 1 }
    ]);

    // 2. Attempt to fetch them via the API
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
      
    // 3. Expect success and an array of data
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });
});

describe('GET /api/vehicles/search', () => {
  it('should filter vehicles based on query parameters', async () => {
    // Seed some specific vehicles for the search test
    await Vehicle.create([
      { make: 'Tata', model: 'Nexon', category: 'SUV', price: 1200000, quantity: 3 },
      { make: 'Mahindra', model: 'Thar', category: 'SUV', price: 1500000, quantity: 2 }
    ]);

    // Test searching for 'Tata'
    const response = await request(app)
      .get('/api/vehicles/search?make=Tata')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].make).toBe('Tata');
    
    // Ensure Mahindra isn't returned
    const mahindraCheck = response.body.find(v => v.make === 'Mahindra');
    expect(mahindraCheck).toBeUndefined();
  });
});