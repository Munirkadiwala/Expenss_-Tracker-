import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdEmail, MdLock, MdSave, MdCameraAlt } from 'react-icons/md';
import styles from './Profile.module.css';

const TABS = ['Account', 'Security', 'Notifications'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('Account');
  const [form, setForm] = useState({ name: '', email: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [notif, setNotif] = useState({ budgetAlerts: true, weeklyReport: false, emailNotif: true });

  useEffect(() => {
    api.get('/profile').then(({ data }) => setForm({ name: data.name, email: data.email }));
  }, []);

  const handleAccount = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const { data } = await api.put('/profile', form);
      updateUser({ ...user, name: data.name, email: data.email });
      setMsg('Profile updated successfully');
    } catch (err) { setError(err.response?.data?.message || 'Failed to update'); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (pwForm.newPassword !== pwForm.confirm) return setError('Passwords do not match');
    try {
      await api.put('/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg('Password updated successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to update password'); }
  };

  const initials = (form.name || user?.name || 'U').charAt(0).toUpperCase();
  const joinDate = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className={styles.page}>
      <h1>Profile Settings</h1>
      <p className={styles.sub}>Manage your account settings and preferences</p>

      <div className={styles.card}>
        <div className={styles.avatarRow}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{initials}</div>
            <button className={styles.camBtn}><MdCameraAlt size={14} /></button>
          </div>
          <div>
            <div className={styles.profileName}>{form.name || user?.name}</div>
            <div className={styles.profileEmail}>{form.email || user?.email}</div>
            <div className={styles.profileJoin}>Member since {joinDate}</div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs}>
          {TABS.map(t => (
            <button key={t} className={`${styles.tab} ${tab === t ? styles.activeTab : ''}`} onClick={() => { setTab(t); setMsg(''); setError(''); }}>
              {t}
            </button>
          ))}
        </div>

        {msg && <div className={styles.success}>{msg}</div>}
        {error && <div className={styles.error}>{error}</div>}

        {tab === 'Account' && (
          <form onSubmit={handleAccount} className={styles.form}>
            <div className={styles.sectionTitle}>Account Information</div>
            <p className={styles.sectionSub}>Update your account details</p>
            <div className={styles.field}>
              <label>Full Name</label>
              <div className={styles.inputWrap}>
                <MdPerson className={styles.inputIcon} />
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className={styles.field}>
              <label>Email Address</label>
              <div className={styles.inputWrap}>
                <MdEmail className={styles.inputIcon} />
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className={styles.btn}><MdSave size={17} /> Save Changes</button>
          </form>
        )}

        {tab === 'Security' && (
          <form onSubmit={handlePassword} className={styles.form}>
            <div className={styles.sectionTitle}>Change Password</div>
            <p className={styles.sectionSub}>Update your password to keep your account secure</p>
            {['currentPassword', 'newPassword', 'confirm'].map((key, i) => (
              <div key={key} className={styles.field}>
                <label>{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
                <div className={styles.inputWrap}>
                  <MdLock className={styles.inputIcon} />
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} required placeholder={['Enter current password', 'Enter new password', 'Confirm new password'][i]} />
                </div>
              </div>
            ))}
            <button type="submit" className={styles.btn}><MdSave size={17} /> Update Password</button>
          </form>
        )}

        {tab === 'Notifications' && (
          <div className={styles.form}>
            <div className={styles.sectionTitle}>Notification Preferences</div>
            <p className={styles.sectionSub}>Manage how you receive alerts</p>
            {[
              { key: 'budgetAlerts', label: 'Budget Alerts', desc: 'Get notified when you approach your budget limit' },
              { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive a weekly summary of your finances' },
              { key: 'emailNotif', label: 'Email Notifications', desc: 'Receive notifications via email' },
            ].map(({ key, label, desc }) => (
              <div key={key} className={styles.notifRow}>
                <div>
                  <div className={styles.notifLabel}>{label}</div>
                  <div className={styles.notifDesc}>{desc}</div>
                </div>
                <label className={styles.toggle}>
                  <input type="checkbox" checked={notif[key]} onChange={e => setNotif({ ...notif, [key]: e.target.checked })} />
                  <span className={styles.slider} />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
