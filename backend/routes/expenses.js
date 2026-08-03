import express from 'express';
import multer from 'multer';
import { isUsingFallback, getFallbackExpenses, saveFallbackExpenses, generateId } from '../db.js';
import Expense from '../models/Expense.js';
import { analyzeBillWithAI } from '../groq.js';

const router = express.Router();

// Multer configured to keep files in memory (essential for Vercel)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 4.5 * 1024 * 1024 } // 4.5MB limit for Vercel Serverless
});

// GET all expenses
router.get('/', async (req, res) => {
  try {
    if (isUsingFallback()) {
      const expenses = await getFallbackExpenses();
      return res.json(expenses);
    }
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST to analyze a bill image
router.post('/analyze', upload.single('bill'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    
    const extractedData = await analyzeBillWithAI(base64Image, mimeType);
    
    res.json({
      success: true,
      data: extractedData,
      previewBase64: `data:${mimeType};base64,${base64Image}` // Return so frontend can show preview and save later
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze bill image' });
  }
});

// POST to create an expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, category, notes, imageUrl } = req.body;

    if (isUsingFallback()) {
      const expenses = await getFallbackExpenses();
      const newExpense = {
        _id: generateId(),
        title,
        amount,
        category,
        notes,
        imageUrl,
        createdAt: new Date().toISOString()
      };
      expenses.unshift(newExpense);
      await saveFallbackExpenses(expenses);
      return res.status(201).json(newExpense);
    }

    const newExpense = new Expense({ title, amount, category, notes, imageUrl });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT to update an expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (isUsingFallback()) {
      const expenses = await getFallbackExpenses();
      const index = expenses.findIndex(e => e._id === id);
      if (index === -1) return res.status(404).json({ error: 'Expense not found' });
      
      expenses[index] = { ...expenses[index], ...updateData };
      await saveFallbackExpenses(expenses);
      return res.json(expenses[index]);
    }

    const updatedExpense = await Expense.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedExpense) return res.status(404).json({ error: 'Expense not found' });
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE an expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isUsingFallback()) {
      let expenses = await getFallbackExpenses();
      expenses = expenses.filter(e => e._id !== id);
      await saveFallbackExpenses(expenses);
      return res.json({ success: true });
    }

    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
