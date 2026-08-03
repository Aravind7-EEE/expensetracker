import { useState, useEffect } from 'react';


function ExpenseForm({ initialData, previewImage, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Other',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        category: initialData.category || 'Other',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      amount: parseFloat(formData.amount) || 0
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Review AI Extraction</h2>
        <span style={{ background: 'var(--success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: '500' }}>
          ✨ AI Processed
        </span>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {previewImage && (
          <div style={{ flex: '1', minWidth: '250px' }}>
            <p style={{ fontWeight: '500', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Bill Image</p>
            <div style={{ 
              width: '100%', 
              height: '300px', 
              borderRadius: '12px', 
              overflow: 'hidden',
              background: '#000'
            }}>
              <img 
                src={previewImage} 
                alt="Bill Preview" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ flex: '2', minWidth: '300px' }}>
          <div className="input-group">
            <label>Merchant / Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              className="input-field"
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label>Amount</label>
              <input 
                type="number" 
                name="amount" 
                step="0.01" 
                value={formData.amount} 
                onChange={handleChange} 
                className="input-field"
                required 
              />
            </div>

            <div className="input-group">
              <label>Category</label>
              <input 
                type="text" 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Notes (AI feedback or manual notes)</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              className="input-field"
              rows="3"
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Expense</button>
            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
