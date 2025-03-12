import express from 'express';
import cors from 'cors';
import { handleFlodeskAction } from './src/handlers/flodeskHandler.js';

const app = express();

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create router for API routes
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Flodesk endpoints
apiRouter.get('/flodesk/segments', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key is required in x-api-key header'
      });
    }

    console.log('GET request to /api/flodesk/segments');
    
    await handleFlodeskAction(req, res, {
      action: 'getAllSegments',
      apiKey,
      payload: {}
    });
  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

apiRouter.get('/flodesk/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key is required in x-api-key header'
      });
    }

    console.log('GET request to /api/flodesk/subscribers');
    
    await handleFlodeskAction(req, res, {
      action: 'getAllSubscribers',
      apiKey,
      payload: {}
    });
  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Keep the POST endpoint for backward compatibility
apiRouter.post('/flodesk', async (req, res) => {
  try {
    console.log('POST request to /api/flodesk');
    await handleFlodeskAction(req, res);
  } catch (error) {
    console.error('Server Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Mount API routes
app.use('/api', apiRouter);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  console.log('404 for path:', req.originalUrl);
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    error: err.message
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For Vercel
export default app;