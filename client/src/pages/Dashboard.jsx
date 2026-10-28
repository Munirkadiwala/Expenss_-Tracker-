import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { MdTrendingUp, MdTrendingDown, MdSavings, MdCalendarMonth, MdWarning } from 'react-icons/md';
import styles from './Dashboard.module.css';

const EXPENSE_COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [budget, setBudget] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/expenses'),
      api.get('/income'),
      api.get('/budget'),
    ]).then(([exp, inc, bud]) => {
      setExpenses(exp.data);
      setIncome(inc.data);
      setBudget(bud.data.amount || 0);
    }).finally(() => setLoading(false));
  }, []);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const savings = totalIncome - totalExpenses;
  const budgetUsedPct = budget > 0 ? Math.round((totalExpenses / budget) * 100) : 0;

  // Expense distribution by category
  const catMap = {};
  expenses.forEach(e => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Monthly bar data (last 6 months)
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

  // Recent transactions (combined, sorted)
  const recent = [
    ...expenses.map(e => ({ ...e, type: 'expense' })),
    ...income.map(i => ({ ...i, type: 'income' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Welcome back! Here's your financial overview.</p>
      </div>

      {budget > 0 && budgetUsedPct >= 80 && (
        <div className={styles.alert}>
          <MdWarning size={18} />
          Warning: You've used {budgetUsedPct}% of your monthly budget. You're approaching your limit.
        </div>
      )}

      <div className={styles.cards}>
        <div className={`${styles.card} ${styles.green}`}>
          <div><div className={styles.cardLabel}>Total Income</div><div className={styles.cardValue}>₹{totalIncome.toLocaleString()}</div><div className={styles.cardSub}>+12% from last month</div></div>
          <MdTrendingUp size={28} color="#2ecc71" />
        </div>
        <div className={`${styles.card} ${styles.red}`}>
          <div><div className={styles.cardLabel}>Total Expenses</div><div className={styles.cardValue} style={{color:'#e74c3c'}}>₹{totalExpenses.toLocaleString()}</div><div className={styles.cardSub}>+5% from last month</div></div>
          <MdTrendingDown size={28} color="#e74c3c" />
        </div>
        <div className={`${styles.card} ${styles.blue}`}>
          <div><div className={styles.cardLabel}>Savings</div><div className={styles.cardValue} style={{color:'#3498db'}}>₹{savings.toLocaleString()}</div><div className={styles.cardSub}>{totalIncome > 0 ? ((savings/totalIncome)*100).toFixed(1) : 0}% of income</div></div>
          <MdSavings size={28} color="#3498db" />
        </div>
        <div className={`${styles.card} ${styles.purple}`}>
          <div><div className={styles.cardLabel}>Monthly Budget</div><div className={styles.cardValue} style={{color:'#9b59b6'}}>₹{budget.toLocaleString()}</div><div className={styles.cardSub}>₹{(budget - totalExpenses).toLocaleString()} remaining</div></div>
          <MdCalendarMonth size={28} color="#9b59b6" />
        </div>
      </div>

      {budget > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Budget Overview</div>
          <div className={styles.budgetBar}>
            <div className={styles.budgetBarTop}>
              <span>Budget Used</span>
              <span>₹{totalExpenses.toLocaleString()} / ₹{budget.toLocaleString()}</span>
            </div>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ width: `${Math.min(budgetUsedPct, 100)}%`, background: budgetUsedPct >= 80 ? '#e74c3c' : '#2ecc71' }} />
            </div>
            <div className={styles.barPct}>{budgetUsedPct}% of your budget used</div>
          </div>
        </div>
      )}

      <div className={styles.charts}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Expense Distribution</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={EXPENSE_COLORS[i % EXPENSE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className={styles.empty}>No expenses yet</p>}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Income vs Expense (Monthly)</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="Income" fill="#2ecc71" radius={[4,4,0,0]} />
              <Bar dataKey="Expense" fill="#e74c3c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>6-Month Financial Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="Income" stroke="#2ecc71" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Expense" stroke="#e74c3c" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Recent Transactions</div>
        {recent.length === 0 && <p className={styles.empty}>No transactions yet</p>}
        {recent.map((t, i) => (
          <div key={i} className={styles.txRow}>
            <div className={`${styles.txIcon} ${t.type === 'income' ? styles.incomeIcon : styles.expenseIcon}`}>
              {t.type === 'income' ? <MdTrendingUp size={18} /> : <MdTrendingDown size={18} />}
            </div>
            <div className={styles.txInfo}>
              <div className={styles.txName}>{t.description || t.category || t.source}</div>
              <div className={styles.txMeta}>{t.category || t.source} • {new Date(t.date).toLocaleDateString()}</div>
            </div>
            <div className={`${styles.txAmount} ${t.type === 'income' ? styles.inc : styles.exp}`}>
              {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
