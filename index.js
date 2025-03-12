import express from 'express';
import { handleFlodeskAction } from './src/handlers/flodeskHandler';

const app = express();
app.use(express.json());

// Flodesk endpoint
app.post('/api/flodesk', handleFlodeskAction);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;