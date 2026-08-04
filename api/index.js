import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import expensesRouter from './routes/expenses.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Connect to DB or Fallback
await connectDB();

// Routes
app.use('/api/expenses', expensesRouter);
app.use('/expenses', expensesRouter);

// Base route for health check
app.get('/api', (req, res) => {
  res.json({ message: 'AI Expense Tracker API is running' });
});
app.get('/', (req, res) => {
  res.json({ message: 'AI Expense Tracker API is running' });
});

// For local development, start the server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel Serverless Functions
export default app;
