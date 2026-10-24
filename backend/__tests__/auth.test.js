const request = require('supertest');
const app = require('../src/app'); // We haven't built this yet!

describe('POST /api/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@dealership.com',
        password: 'password123'
      });
      
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('message');
  });
});