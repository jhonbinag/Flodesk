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

// Subscriber Endpoints
// 1. Retrieve All Subscribers
apiRouter.get('/flodesk/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    console.log('GET request to /api/flodesk/subscribers');
    await handleFlodeskAction(req, res, {
      action: 'getAllSubscribers',
      apiKey,
      payload: {}
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 2. Retrieve a Specific Subscriber by Email
apiRouter.get('/flodesk/subscribers/:email', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const email = decodeURIComponent(req.params.email);
    console.log(`GET request to /api/flodesk/subscribers/${email}`);
    
    await handleFlodeskAction(req, res, {
      action: 'getSubscriber',
      apiKey,
      payload: { email }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 3. Create/Update Subscriber
apiRouter.put('/flodesk/subscribers/:email', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const email = decodeURIComponent(req.params.email);
    const { firstName, lastName } = req.body;
    
    console.log(`PUT request to /api/flodesk/subscribers/${email}`);
    
    await handleFlodeskAction(req, res, {
      action: 'createOrUpdateSubscriber',
      apiKey,
      payload: {
        email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 4. Add Subscriber to Segments
apiRouter.post('/flodesk/subscribers/:email/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const email = decodeURIComponent(req.params.email);
    const { segmentIds } = req.body;
    
    if (!Array.isArray(segmentIds)) {
      return res.status(400).json({
        success: false,
        message: 'segmentIds must be an array'
      });
    }

    console.log(`POST request to /api/flodesk/subscribers/${email}/segments`);
    
    await handleFlodeskAction(req, res, {
      action: 'addToSegments',
      apiKey,
      payload: {
        email,
        segmentIds
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 5. Remove Subscriber from Segment
apiRouter.delete('/flodesk/subscribers/:email/segments/:segmentId', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const email = decodeURIComponent(req.params.email);
    const { segmentId } = req.params;
    
    console.log(`DELETE request to /api/flodesk/subscribers/${email}/segments/${segmentId}`);
    
    await handleFlodeskAction(req, res, {
      action: 'removeFromSegment',
      apiKey,
      payload: {
        email,
        segmentId
      }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 6. Unsubscribe from All Lists
apiRouter.post('/flodesk/subscribers/:email/unsubscribe', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }

    const email = decodeURIComponent(req.params.email);
    
    console.log(`POST request to /api/flodesk/subscribers/${email}/unsubscribe`);
    
    await handleFlodeskAction(req, res, {
      action: 'unsubscribeFromAll',
      apiKey,
      payload: { email }
    });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Mount API routes at /api
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