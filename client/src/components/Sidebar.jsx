import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MdDashboard, MdAddCircleOutline, MdTrendingUp, MdTrendingDown,
  MdHistory, MdAccountBalanceWallet, MdBarChart, MdPerson, MdLogout
} from 'react-icons/md';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/add-expense', icon: <MdAddCircleOutline />, label: 'Add Expense' },
  { to: '/add-income', icon: <MdTrendingUp />, label: 'Add Income' },
  { to: '/expense-history', icon: <MdTrendingDown />, label: 'Expense History' },
  { to: '/income-history', icon: <MdHistory />, label: 'Income History' },
  { to: '/budget', icon: <MdAccountBalanceWallet />, label: 'Budget' },
  { to: '/reports', icon: <MdBarChart />, label: 'Reports' },
  { to: '/profile', icon: <MdPerson />, label: 'Profile' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <MdAccountBalanceWallet size={22} color="#fff" />
        </div>
        <div>
          <div className={styles.logoTitle}>Expense Tracker</div>
          <div className={styles.logoSub}>Manage your finances</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button className={styles.logout} onClick={handleLogout}>
        <MdLogout size={18} />
        Logout
      </button>
    </aside>
  );
}
