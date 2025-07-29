const request = require('supertest');
const app = require('../server');

describe('Frontend Server', () => {
  test('serves main page', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
  });

  test('frontend health check works', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
    expect(response.body.service).toBe('frontend');
  });

  test('calculation proxy returns error when backend unavailable', async () => {
    const response = await request(app)
      .post('/api/calculate')
      .send({ a: 2, b: 3, operation: 'add' });
    
    // Should return 503 when backend is not running
    expect(response.status).toBe(503);
    expect(response.body.error).toBe('Backend service unavailable');
  });
});
