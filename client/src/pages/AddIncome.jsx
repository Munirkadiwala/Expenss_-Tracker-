import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MdSave, MdArrowBack } from 'react-icons/md';
import styles from './Form.module.css';

const SOURCES = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other'];

export default function AddIncome() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '', source: '', description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/income', form);
      navigate('/income-history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}><MdArrowBack size={20} /></button>
        <div>
          <h1>Add Income</h1>
          <p>Record a new income transaction</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTitle}>Income Details</div>
        <p className={styles.cardSub}>Fill in the information below to add a new income</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Amount (₹)</label>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className={styles.field}>
            <label>Source</label>
            <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} required>
              <option value="">Select income source</option>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Description</label>
            <textarea
              placeholder="Additional details about this income"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Date</label>
            <input
              type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.btn} disabled={loading}>
              <MdSave size={18} /> {loading ? 'Saving...' : 'Save Income'}
            </button>
            <button type="button" className={styles.cancel} onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
