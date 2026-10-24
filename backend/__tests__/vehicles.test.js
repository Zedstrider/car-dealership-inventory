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

describe('PUT /api/vehicles/:id', () => {
  it('should update an existing vehicle when authenticated', async () => {
    // 1. Create a vehicle to update
    const vehicle = await Vehicle.create({
      make: 'Hyundai',
      model: 'Creta',
      category: 'SUV',
      price: 1600000,
      quantity: 4
    });

    // 2. Send the PUT request with updated data
    const response = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        price: 1650000, // Price hike
        quantity: 5     // Restocked one
      });
      
    // 3. Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body.price).toBe(1650000);
    expect(response.body.quantity).toBe(5);
    
    // 4. Verify in database
    const updatedVehicle = await Vehicle.findById(vehicle._id);
    expect(updatedVehicle.price).toBe(1650000);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('should prevent non-admin users from deleting a vehicle', async () => {
    const vehicle = await Vehicle.create({
      make: 'Maruti',
      model: 'Swift',
      category: 'Hatchback',
      price: 800000,
      quantity: 2
    });

    // Using the standard 'token' from beforeAll (normal user)
    const response = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`);
      
    // 403 Forbidden since they are authenticated but lack admin privileges
    expect(response.statusCode).toBe(403); 
  });

  it('should allow admin users to delete a vehicle', async () => {
    const vehicle = await Vehicle.create({
      make: 'Honda',
      model: 'City',
      category: 'Sedan',
      price: 1200000,
      quantity: 1
    });

    // Create an admin user on the fly for this test
    const adminUser = await User.create({ 
      email: 'superadmin@dealership.com', 
      password: 'password123',
      isAdmin: true // We will add this to the schema in the green phase
    });
    
    const adminToken = jwt.sign(
      { userId: adminUser._id }, 
      process.env.JWT_SECRET || 'testsecret', 
      { expiresIn: '1h' }
    );

    const response = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
      
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Vehicle deleted');
    
    // Verify it is actually gone from the DB
    const deletedVehicle = await Vehicle.findById(vehicle._id);
    expect(deletedVehicle).toBeNull();
  });
});