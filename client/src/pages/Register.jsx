import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MdEmail, MdLock, MdPerson, MdAccountBalanceWallet } from 'react-icons/md';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setError('');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <MdAccountBalanceWallet size={28} color="#fff" />
        </div>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.sub}>Sign up to start tracking your expenses</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label>Full Name</label>
            <div className={styles.inputWrap}>
              <MdPerson className={styles.inputIcon} />
              <input
                placeholder="Munir"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <div className={styles.inputWrap}>
              <MdEmail className={styles.inputIcon} />
              <input
                type="email"
                placeholder="munir@gmail.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.inputWrap}>
              <MdLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Confirm Password</label>
            <div className={styles.inputWrap}>
              <MdLock className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Confirm your password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className={styles.switch}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
