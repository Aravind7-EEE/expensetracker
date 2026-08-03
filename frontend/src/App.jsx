import { useState, useEffect } from 'react';
import axios from 'axios';
import UploadSection from './components/UploadSection';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseTips from './components/ExpenseTips';
import './App.css'; // specific app styles if needed, but index.css covers mostly

const API_URL = '/api/expenses';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null); // Data from AI
  const [editingExpense, setEditingExpense] = useState(null); // Existing expense being edited
  const [previewImage, setPreviewImage] = useState(null); // base64 preview
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(API_URL);
      if (Array.isArray(res.data)) {
        setExpenses(res.data);
      } else {
        console.error('API returned non-array:', res.data);
        throw new Error('Invalid API response');
      }
    } catch (err) {
      console.error('Failed to fetch expenses', err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to load expenses.';
      setError(`Failed to load expenses: ${errMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Handle file upload
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsAnalyzing(true);
    setError('');
    
    const formData = new FormData();
    formData.append('bill', file);

    try {
      // In production, Vite proxies /api to the backend. See vite.config.js
      const res = await axios.post(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAnalyzedData(res.data.data);
      setPreviewImage(res.data.previewBase64);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to analyze the bill image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle saving the expense (Create or Update)
  const handleSaveExpense = async (expenseData) => {
    try {
      if (editingExpense) {
        // Update existing expense
        await axios.put(`${API_URL}/${editingExpense._id}`, expenseData);
        setEditingExpense(null);
      } else {
        // Create new expense
        const payload = { ...expenseData, imageUrl: previewImage };
        await axios.post(API_URL, payload);
        setAnalyzedData(null);
        setPreviewImage(null);
      }
      
      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError('Failed to save expense.');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
      setError('Failed to delete expense.');
    }
  };

  return (
    <div className="app-container">
      <header style={{ marginBottom: '2rem' }}>
        <h1>AI Expense Tracker</h1>
        <p>Upload your bills. Let AI do the data entry.</p>
      </header>

      {error && (
        <div style={{ padding: '1rem', background: 'var(--danger)', color: 'white', borderRadius: '12px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="main-content">
          {!analyzedData && !editingExpense ? (
            <UploadSection onUpload={handleFileUpload} isAnalyzing={isAnalyzing} />
          ) : (
            <ExpenseForm 
              initialData={editingExpense || analyzedData} 
              previewImage={editingExpense ? editingExpense.imageUrl : previewImage}
              onSave={handleSaveExpense}
              onCancel={() => { 
                setAnalyzedData(null); 
                setPreviewImage(null); 
                setEditingExpense(null); 
              }}
            />
          )}

          <h2 style={{ marginTop: '2rem' }}>Recent Expenses</h2>
          {isLoading ? (
            <p>Loading expenses...</p>
          ) : (
            <ExpenseList expenses={expenses} onDelete={handleDelete} onEdit={handleEdit} />
          )}
        </div>

        <div className="sidebar">
          <ExpenseTips expenses={expenses} />
        </div>
      </div>
    </div>
  );
}

export default App;
