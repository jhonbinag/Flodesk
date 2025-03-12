import express from 'express';
import { handleFlodeskAction } from './src/handlers/flodeskHandler.js';

const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});

// Flodesk endpoint
app.post('/api/flodesk', async (req, res) => {
  try {
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