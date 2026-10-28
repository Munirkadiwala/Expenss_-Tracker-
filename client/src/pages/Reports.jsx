import { useEffect, useState } from 'react';
import api from '../api/axios';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { MdPictureAsPdf, MdTableChart, MdCalendarMonth, MdTrendingUp, MdTrendingDown, MdSavings } from 'react-icons/md';
import styles from './Reports.module.css';

const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TABS = ['Overview', 'Expenses', 'Trends'];

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [period, setPeriod] = useState('Monthly Report');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/expenses'), api.get('/income')]).then(([e, i]) => {
      setExpenses(e.data);
      setIncome(i.data);
    }).finally(() => setLoading(false));
  }, []);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Category pie
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Monthly bar (last 6 months)
  const now = new Date();
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = d.getMonth(); const y = d.getFullYear();
    const inc = income.filter(x => new Date(x.date).getMonth() === m && new Date(x.date).getFullYear() === y)
      .reduce((s, x) => s + x.amount, 0);
    const exp = expenses.filter(x => new Date(x.date).getMonth() === m && new Date(x.date).getFullYear() === y)
      .reduce((s, x) => s + x.amount, 0);
    return { month: MONTHS[m], Income: inc, Expense: exp };
  });

  // Daily spending (last 30 days)
  const dailyMap = {};
  expenses.forEach(e => {
    const d = new Date(e.date).toLocaleDateString();
    dailyMap[d] = (dailyMap[d] || 0) + e.amount;
  });
  const dailyData = Object.entries(dailyMap).slice(-14).map(([date, amount]) => ({ date, amount }));

  const exportPDF = () => window.print();
  const exportExcel = () => {
    const rows = [['Type','Description','Category/Source','Amount','Date'],
      ...expenses.map(e => ['Expense', e.description, e.category, e.amount, new Date(e.date).toLocaleDateString()]),
      ...income.map(i => ['Income', i.description, i.source, i.amount, new Date(i.date).toLocaleDateString()])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'report.csv'; a.click();
  };

  if (loading) return <div style={{ padding: 40, color: '#9aa5b4' }}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1>Reports &amp; Analytics</h1>
          <p>Detailed financial reports and insights</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.btnOutline} onClick={exportPDF}><MdPictureAsPdf size={18} /> PDF</button>
          <button className={styles.btnOutline} onClick={exportExcel}><MdTableChart size={18} /> Excel</button>
        </div>
      </div>

      <div className={styles.periodRow}>
        <MdCalendarMonth size={18} color="#9aa5b4" />
        <select value={period} onChange={e => setPeriod(e.target.value)} className={styles.periodSelect}>
          <option>Monthly Report</option>
          <option>Quarterly Report</option>
          <option>Annual Report</option>
        </select>
      </div>

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.green}`}>
          <div className={styles.cardLabel}>Total Income</div>
          <div className={styles.cardValue}>₹{totalIncome.toLocaleString()}</div>
          <MdTrendingUp size={24} color="#2ecc71" />
        </div>
        <div className={`${styles.card} ${styles.red}`}>
          <div className={styles.cardLabel}>Total Expenses</div>
          <div className={styles.cardValue} style={{ color: '#e74c3c' }}>₹{totalExpenses.toLocaleString()}</div>
          <MdTrendingDown size={24} color="#e74c3c" />
        </div>
        <div className={`${styles.card} ${styles.blue}`}>
          <div className={styles.cardLabel}>Net Savings</div>
          <div className={styles.cardValue} style={{ color: '#3498db' }}>₹{netSavings.toLocaleString()}</div>
          <MdTrendingUp size={24} color="#3498db" />
        </div>
        <div className={`${styles.card} ${styles.purple}`}>
          <div className={styles.cardLabel}>Savings Rate</div>
          <div className={styles.cardValue} style={{ color: '#9b59b6' }}>{savingsRate}%</div>
          <MdSavings size={24} color="#9b59b6" />
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className={styles.charts}>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Expense Distribution</div>
            <div className={styles.sectionSub}>Breakdown by category</div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className={styles.empty}>No data</p>}
          </div>
          <div className={styles.section}>
            <div className={styles.sectionTitle}>Daily Spending Pattern</div>
            <div className={styles.sectionSub}>Expenses over time</div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#e74c3c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'Expenses' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Monthly Expense Breakdown</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Bar dataKey="Expense" fill="#e74c3c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className={styles.catTable}>
            {pieData.map((cat, i) => (
              <div key={cat.name} className={styles.catRow}>
                <span className={styles.catDot} style={{ background: COLORS[i % COLORS.length] }} />
                <span className={styles.catName}>{cat.name}</span>
                <span className={styles.catAmount}>₹{cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Trends' && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>6-Month Income vs Expense Trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="Income" stroke="#2ecc71" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Expense" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
