function ExpenseList({ expenses, onDelete, onEdit }) {
  if (expenses.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', marginTop: '1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🍃</div>
        <p style={{ color: 'var(--text-muted)' }}>No expenses yet. Upload a bill to get started.</p>
      </div>
    );
  }

  const getCategoryEmoji = (cat) => {
    const map = {
      'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️', 
      'Bills': '📄', 'Health': '⚕️', 'Entertainment': '🎬', 
      'Travel': '✈️', 'Education': '📚', 'Other': '📦'
    };
    return map[cat] || '📦';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
      {expenses.map((expense) => (
        <div key={expense._id} className="glass-panel" style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          
          {/* Left Side: Thumbnail & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              background: expense.imageUrl ? 'transparent' : 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {expense.imageUrl ? (
                <img src={expense.imageUrl} alt={expense.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                getCategoryEmoji(expense.category)
              )}
            </div>

            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{expense.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ 
                  background: 'var(--card-bg)', 
                  padding: '2px 8px', 
                  borderRadius: '6px',
                  border: '1px solid var(--card-border)',
                  color: 'var(--text-muted)'
                }}>
                  {expense.category}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {new Date(expense.createdAt).toLocaleDateString()}
                </span>
              </div>
              {expense.notes && (
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', opacity: 0.8 }}>
                  📝 {expense.notes}
                </p>
              )}
            </div>
          </div>

          {/* Right Side: Amount & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
              ₹{parseFloat(expense.amount).toFixed(2)}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => onEdit(expense)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem', borderRadius: '8px' }}
                title="Edit"
              >
                ✏️
              </button>
              <button 
                onClick={() => onDelete(expense._id)}
                className="btn btn-danger"
                style={{ padding: '0.5rem', borderRadius: '8px' }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
