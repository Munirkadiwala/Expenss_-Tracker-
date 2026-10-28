import { useEffect, useState } from 'react';
import api from '../api/axios';
import { MdSave, MdWarning } from 'react-icons/md';
import styles from './Budget.module.css';

export default function Budget() {
  const [budget, setBudget] = useState(0);
  const [input, setInput] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/budget'), api.get('/expenses')]).then(([b, e]) => {
      setBudget(b.data.amount || 0);
      setInput(b.data.amount || '');
      setTotalSpent(e.data.reduce((s, x) => s + x.amount, 0));
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await api.post('/budget', { amount: Number(input) });
    setBudget(Number(input));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const remaining = budget - totalSpent;
  const pct = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
  const isWarning = pct >= 80;

  if (loading) return <div style={{ padding: 40, color: '#9aa5b4' }}>Loading...</div>;

  return (
    <div className={styles.page}>
      <h1>Budget Management</h1>
      <p className={styles.sub}>Set and track your monthly budget limits</p>

      {isWarning && (
        <div className={styles.alert}>
          <MdWarning size={18} /> Warning! You've used {pct}% of your monthly budget. Your budget is almost exhausted.
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardTitle}>Set Monthly Budget</div>
        <p className={styles.cardSub}>Define your total monthly spending limit</p>
        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.field}>
            <label>Monthly Budget (₹)</label>
            <input
              type="number" min="0" value={input}
              onChange={e => setInput(e.target.value)}
              required
            />
            <span className={styles.hint}>This will be your spending limit for the month</span>
          </div>
          <button type="submit" className={styles.btn}>
            <MdSave size={18} /> {saved ? 'Saved!' : 'Update Budget'}
          </button>
        </form>
      </div>

      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.purple}`}>
          <div className={styles.statLabel}>Monthly Budget</div>
          <div className={styles.statValue}>₹{budget.toLocaleString()}</div>
        </div>
        <div className={`${styles.statCard} ${styles.red}`}>
          <div className={styles.statLabel}>Total Spent</div>
          <div className={styles.statValue} style={{ color: '#e74c3c' }}>₹{totalSpent.toLocaleString()}</div>
          <div className={styles.statSub}>{pct}% of budget</div>
        </div>
        <div className={`${styles.statCard} ${styles.green}`}>
          <div className={styles.statLabel}>Remaining</div>
          <div className={styles.statValue} style={{ color: remaining >= 0 ? '#2ecc71' : '#e74c3c' }}>
            ₹{Math.abs(remaining).toLocaleString()}
          </div>
          <div className={styles.statSub}>{remaining >= 0 ? `${100 - pct}% available` : 'Over budget'}</div>
        </div>
      </div>

      {budget > 0 && (
        <div className={styles.card}>
          <div className={styles.cardTitle}>Budget Usage</div>
          <div className={styles.barTop}>
            <span>Budget Used</span>
            <span>₹{totalSpent.toLocaleString()} / ₹{budget.toLocaleString()}</span>
          </div>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ width: `${pct}%`, background: isWarning ? '#e74c3c' : '#2ecc71' }} />
          </div>
          <div className={styles.barPct}>{pct}% of your budget used</div>
        </div>
      )}
    </div>
  );
}
