import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MdAdd, MdDownload, MdSearch, MdEdit, MdDelete, MdFilterList } from 'react-icons/md';
import styles from './History.module.css';

const CATEGORIES = ['All', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

export default function ExpenseHistory() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/expenses', { params: { search, category } });
      setExpenses(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchExpenses(); }, [search, category]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await api.put(`/expenses/${editItem._id}`, editItem);
    setEditItem(null);
    fetchExpenses();
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const exportCSV = () => {
    const rows = [['Description', 'Category', 'Amount', 'Date'],
      ...expenses.map(e => [e.description, e.category, e.amount, new Date(e.date).toLocaleDateString()])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'expenses.csv'; a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Expense History</h1>
          <p>View and manage all your expenses</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnGreen} onClick={() => navigate('/add-expense')}>
            <MdAdd size={18} /> Add Expense
          </button>
          <button className={styles.btnOutline} onClick={exportCSV}>
            <MdDownload size={18} /> Export
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <MdSearch className={styles.searchIcon} />
          <input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filterRight}>
          <MdFilterList size={20} color="#9aa5b4" />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className={`${styles.totalCard} ${styles.red}`}>
        <div className={styles.totalLabel}>Total Expenses</div>
        <div className={styles.totalValue}>₹{total.toLocaleString()}</div>
        <div className={styles.totalSub}>{expenses.length} transactions</div>
      </div>

      <div className={styles.listCard}>
        <div className={styles.listTitle}>All Expenses</div>
        {loading && <p className={styles.empty}>Loading...</p>}
        {!loading && expenses.length === 0 && <p className={styles.empty}>No expenses found</p>}
        {expenses.map(exp => (
          <div key={exp._id} className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowName}>{exp.description || exp.category}</div>
              <div className={styles.rowMeta}>
                <span className={`${styles.badge} ${styles.expBadge}`}>{exp.category}</span>
                {new Date(exp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.rowAmount} style={{ color: '#e74c3c' }}>₹{exp.amount.toLocaleString()}</span>
              <button className={styles.iconBtn} onClick={() => setEditItem({ ...exp })}>
                <MdEdit size={18} color="#9aa5b4" />
              </button>
              <button className={styles.iconBtn} onClick={() => handleDelete(exp._id)}>
                <MdDelete size={18} color="#e74c3c" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editItem && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Edit Expense</h3>
            <form onSubmit={handleEdit} className={styles.modalForm}>
              <label>Amount (₹)</label>
              <input type="number" value={editItem.amount} onChange={e => setEditItem({ ...editItem, amount: e.target.value })} required />
              <label>Category</label>
              <select value={editItem.category} onChange={e => setEditItem({ ...editItem, category: e.target.value })}>
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
              <label>Description</label>
              <input value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })} />
              <label>Date</label>
              <input type="date" value={editItem.date?.split('T')[0]} onChange={e => setEditItem({ ...editItem, date: e.target.value })} />
              <div className={styles.modalActions}>
                <button type="submit" className={styles.btnGreen}>Save</button>
                <button type="button" className={styles.btnOutline} onClick={() => setEditItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
