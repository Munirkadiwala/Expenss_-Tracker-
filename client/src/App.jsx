import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome';
import ExpenseHistory from './pages/ExpenseHistory';
import IncomeHistory from './pages/IncomeHistory';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="add-expense" element={<AddExpense />} />
            <Route path="add-income" element={<AddIncome />} />
            <Route path="expense-history" element={<ExpenseHistory />} />
            <Route path="income-history" element={<IncomeHistory />} />
            <Route path="budget" element={<Budget />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
