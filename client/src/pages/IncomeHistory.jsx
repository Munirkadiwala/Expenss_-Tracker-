import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MdAdd, MdDownload, MdSearch, MdEdit, MdDelete, MdFilterList } from 'react-icons/md';
import styles from './History.module.css';

const SOURCES = ['All', 'Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Gift', 'Other'];

export default function IncomeHistory() {
  const navigate = useNavigate();
  const [income, setIncome] = useState([]);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('All');
  const [editItem, setEditItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/income', { params: { search, source } });
      setIncome(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchIncome(); }, [search, source]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this income?')) return;
    await api.delete(`/income/${id}`);
    fetchIncome();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await api.put(`/income/${editItem._id}`, editItem);
    setEditItem(null);
    fetchIncome();
  };

  const total = income.reduce((s, i) => s + i.amount, 0);

  const exportCSV = () => {
    const rows = [['Description', 'Source', 'Amount', 'Date'],
      ...income.map(i => [i.description, i.source, i.amount, new Date(i.date).toLocaleDateString()])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'income.csv'; a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Income History</h1>
          <p>View and manage all your income sources</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnGreen} onClick={() => navigate('/add-income')}>
            <MdAdd size={18} /> Add Income
          </button>
          <button className={styles.btnOutline} onClick={exportCSV}>
            <MdDownload size={18} /> Export
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <MdSearch className={styles.searchIcon} />
          <input placeholder="Search income..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className={styles.filterRight}>
          <MdFilterList size={20} color="#9aa5b4" />
          <select value={source} onChange={e => setSource(e.target.value)}>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className={`${styles.totalCard} ${styles.green}`}>
        <div className={styles.totalLabel}>Total Income</div>
        <div className={styles.totalValue}>₹{total.toLocaleString()}</div>
        <div className={styles.totalSub}>{income.length} transactions</div>
      </div>

      <div className={styles.listCard}>
        <div className={styles.listTitle}>All Income</div>
        {loading && <p className={styles.empty}>Loading...</p>}
        {!loading && income.length === 0 && <p className={styles.empty}>No income found</p>}
        {income.map(inc => (
          <div key={inc._id} className={styles.row}>
            <div className={styles.rowInfo}>
              <div className={styles.rowName}>{inc.description || inc.source}</div>
              <div className={styles.rowMeta}>
                <span className={`${styles.badge} ${styles.incBadge}`}>{inc.source}</span>
                {new Date(inc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.rowAmount} style={{ color: '#2ecc71' }}>+₹{inc.amount.toLocaleString()}</span>
              <button className={styles.iconBtn} onClick={() => setEditItem({ ...inc })}>
                <MdEdit size={18} color="#9aa5b4" />
              </button>
              <button className={styles.iconBtn} onClick={() => handleDelete(inc._id)}>
                <MdDelete size={18} color="#e74c3c" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editItem && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Edit Income</h3>
            <form onSubmit={handleEdit} className={styles.modalForm}>
              <label>Amount (₹)</label>
              <input type="number" value={editItem.amount} onChange={e => setEditItem({ ...editItem, amount: e.target.value })} required />
              <label>Source</label>
              <select value={editItem.source} onChange={e => setEditItem({ ...editItem, source: e.target.value })}>
                {SOURCES.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
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
