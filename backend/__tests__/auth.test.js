const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const User = require('../src/models/User');

jest.setTimeout(300000);

let mongoServer;

// Connect to the in-memory database before any tests run
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// Clear the database between tests so they don't interfere with each other
beforeEach(async () => {
  await User.deleteMany({});
});

// Disconnect after all tests are done
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('POST /api/auth/register', () => {
  it('should register a new user and save to the database', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@dealership.com',
        password: 'password123'
      });
      
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message');

    // This is the new part: Check if the user was actually saved!
    const userInDb = await User.findOne({ email: 'test@dealership.com' });
    expect(userInDb).toBeTruthy();
    expect(userInDb.email).toBe('test@dealership.com');
  });
});

describe('POST /api/auth/login', () => {
  it('should login an existing user and return a JWT token', async () => {
    // 1. Manually insert a test user into the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await User.create({
      email: 'login@dealership.com',
      password: hashedPassword
    });

    // 2. Attempt to hit the login endpoint
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@dealership.com',
        password: 'password123'
      });
      
    // 3. Expect success and a JWT token
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});