function ExpenseTips({ expenses }) {
  if (expenses.length === 0) return null;

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  
  // Calculate category sums
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});

  // Find highest category
  let highestCategory = '';
  let highestAmount = 0;
  for (const [cat, amt] of Object.entries(categoryTotals)) {
    if (amt > highestAmount) {
      highestAmount = amt;
      highestCategory = cat;
    }
  }

  const getTip = () => {
    if (total > 2000) return "Your total spending is quite high. Try separating your needs, wants, and savings using the 50/30/20 rule.";
    
    switch (highestCategory) {
      case 'Food':
        return "Food is your highest expense. Try meal prepping and reducing eating out to save money.";
      case 'Shopping':
        return "Shopping is taking up a lot of your budget. Try delaying non-essential purchases for 48 hours.";
      case 'Transport':
        return "Transport costs are high. Consider public transport, carpooling, or biking if possible.";
      case 'Entertainment':
        return "Entertainment expenses are high. Look for free local events or review your subscription services.";
      case 'Health':
        return "Health is important! Make sure you are using any preventive care benefits available to you.";
      case 'Bills':
        return "Utility and recurring bills are high. Try negotiating rates or switching providers.";
      default:
        return "Keep tracking your expenses to build better financial habits!";
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', position: 'sticky', top: '2rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Summary</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Total Spending</p>
        <div style={{ fontSize: '2.5rem', fontWeight: '700', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ₹{total.toFixed(2)}
        </div>
      </div>

      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        borderRadius: '16px', 
        padding: '1.5rem',
        border: '1px solid var(--card-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>💡</span>
          <h4 style={{ margin: 0 }}>Smart Tip</h4>
        </div>
        <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
          {getTip()}
        </p>
      </div>


    </div>
  );
}

export default ExpenseTips;
