import express from 'express';
import cors from 'cors';
import { handleFlodeskAction } from './src/handlers/flodeskHandler.js';

const app = express();

// CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Flodesk endpoint with better error handling
app.post('/api/flodesk', async (req, res) => {
  try {
    console.log('Received request:', { 
      action: req.body?.action,
      hasApiKey: !!req.body?.apiKey 
    });
    
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

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
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