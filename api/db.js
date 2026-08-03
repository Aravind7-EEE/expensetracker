import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

const isVercel = process.env.VERCEL || process.env.NOW_REGION;
const DB_FILE = isVercel 
  ? path.join('/tmp', 'local-expenses.json')
  : path.join(process.cwd(), 'local-expenses.json');

let useFallback = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not defined. Using local JSON fallback storage.');
    useFallback = true;
    await initFallbackDB();
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    useFallback = false;
  } catch (error) {
    console.error('❌ MongoDB connection error. Using local JSON fallback storage.', error);
    useFallback = true;
    await initFallbackDB();
  }
};

export const isUsingFallback = () => useFallback;

// --- JSON Fallback Logic ---
const initFallbackDB = async () => {
  try {
    await fs.access(DB_FILE);
  } catch (error) {
    // File doesn't exist, create it
    await fs.writeFile(DB_FILE, JSON.stringify([]));
  }
};

export const getFallbackExpenses = async () => {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

export const saveFallbackExpenses = async (expenses) => {
  await fs.writeFile(DB_FILE, JSON.stringify(expenses, null, 2));
};

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};
