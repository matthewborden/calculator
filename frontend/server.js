const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API calls to Go backend
app.post('/api/calculate', async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/calculate`, req.body);
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // Backend returned an error response
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // Network error - backend not reachable
      res.status(503).json({ 
        error: 'Backend service unavailable',
        details: 'Cannot connect to calculation service'
      });
    } else {
      // Other error
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
});

// Frontend health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'frontend',
    backend_url: BACKEND_URL,
    timestamp: new Date().toISOString() 
  });
});

// Backend health check proxy
app.get('/api/backend-health', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR',
      service: 'backend',
      error: 'Backend service unavailable'
    });
  }
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only if not in test environment)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Calculator frontend server running on port ${PORT}`);
    console.log(`Backend API URL: ${BACKEND_URL}`);
    console.log(`Visit http://localhost:${PORT} to use the calculator`);
  });
}

module.exports = app;
