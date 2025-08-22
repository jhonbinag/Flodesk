import express from 'express';
import cors from 'cors';
import { handleFlodeskAction } from './src/handlers/flodeskHandler.js';
import { segmentsService } from './src/services/flodesk/segments.js';

const app = express();

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create router for API routes
const apiRouter = express.Router();

// Health check endpoint
// Updated: Force deployment with latest API key validation fixes
apiRouter.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0' });
});

// Test endpoint to verify deployment
apiRouter.get('/test-subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required in Authorization header'
      });
    }
    
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

// Subscriber Endpoints
// 1. Get All Subscribers
// GET https://flodeskendpoints.vercel.app/api/subscribers
apiRouter.get('/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    // Check if we have an id query parameter
    if (req.query.id) {
      // If we have an id, get specific subscriber
      await handleFlodeskAction(req, res, {
        action: 'getSubscriber',
        apiKey,
        payload: { 
          email: decodeURIComponent(req.query.id),
          segmentsOnly: true
        }
      });
    } else {
      // Otherwise get all subscribers
      await handleFlodeskAction(req, res, {
        action: 'getAllSubscribers',
        apiKey,
        payload: {}
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// 2. Get Specific Subscriber by path parameter
apiRouter.get('/subscribers/:email', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    
    await handleFlodeskAction(req, res, {
      action: 'getSubscriber',
      apiKey,
      payload: { 
        email,
        segmentsOnly: true
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

// 3. Create/Update Subscriber
// POST https://flodeskendpoints.vercel.app/api/subscribers
apiRouter.post('/subscribers', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    await handleFlodeskAction(req, res, {
      action: 'createOrUpdateSubscriber',
      apiKey,
      payload: req.body
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

// 4. Add to Segments
// POST https://flodeskendpoints.vercel.app/api/subscribers/{email}/segments
apiRouter.post('/subscribers/:email/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    await handleFlodeskAction(req, res, {
      action: 'addToSegments',
      apiKey,
      payload: { 
        email,
        segmentIds: req.body.segmentIds
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

// 5. Remove from Segment
// DELETE https://flodeskendpoints.vercel.app/api/subscribers/{email}/segments
apiRouter.delete('/subscribers/:email/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required in Authorization header'
      });
    }

    const email = decodeURIComponent(req.params.email);
    const segmentIds = req.body.segment_ids;

    console.log('DELETE Request:', {
      path: req.path,
      email: email,
      segmentIds: segmentIds,
      headers: {
        ...req.headers,
        authorization: 'REDACTED'
      }
    });

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!segmentIds || !Array.isArray(segmentIds) || segmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'segment_ids array is required in request body'
      });
    }

    await handleFlodeskAction(req, res, {
      action: 'removeFromSegment',
      apiKey,
      payload: { 
        email, 
        segment_ids: segmentIds
      }
    });

    return res.json({
      success: true,
      message: `Successfully removed segments from ${email}`
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to remove segments',
      error: error.response?.data || error.message
    });
  }
});

// 6. Unsubscribe from All
// POST https://flodeskendpoints.vercel.app/api/subscribers/{email}/unsubscribe
apiRouter.post('/subscribers/:email/unsubscribe', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    const email = decodeURIComponent(req.params.email);
    
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

// Update subscriber segments
// PATCH https://flodeskendpoints.vercel.app/api/subscribers/{email}/segments
apiRouter.patch('/subscribers/:email/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required in Authorization header'
      });
    }

    const email = decodeURIComponent(req.params.email);
    const segmentIds = req.body.segment_ids;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    if (!segmentIds || !Array.isArray(segmentIds) || segmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'segment_ids array is required in request body'
      });
    }

    await handleFlodeskAction(req, res, {
      action: 'updateSubscriberSegments',
      apiKey,
      payload: { 
        email, 
        segment_ids: segmentIds
      }
    });

    return res.json({
      success: true,
      message: `Successfully updated segments for ${email}`
    });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to update segments',
      error: error.response?.data || error.message
    });
  }
});

// Segment Endpoints
// 1. Get All Segments or Specific Segment by Email
// GET https://flodeskendpoints.vercel.app/api/segments
// GET https://flodeskendpoints.vercel.app/api/segments?id=email@example.com
apiRouter.get('/segments', async (req, res) => {
  try {
    const apiKey = req.headers.authorization;
    
    // Check if we have an id query parameter
    if (req.query.id) {
      // Handle both encoded and unencoded emails
      const email = req.query.id.includes('%40') ? 
        req.query.id : // Already encoded
        encodeURIComponent(req.query.id); // Need to encode

      // If we have an id (email), get segments for that subscriber
      await handleFlodeskAction(req, res, {
        action: 'getSegment',
        apiKey,
        payload: { 
          id: decodeURIComponent(email) // Always decode before processing
        }
      });
    } else {
      // Get all segments
      const segments = await segmentsService.getAllSegments(apiKey);
      return res.json({
        options: segments
      });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({
      options: [], // Return empty options on error
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