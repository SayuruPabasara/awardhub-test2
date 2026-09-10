import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import AuthLayout from '../components/AuthLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await authApi.login(form);
      if (data.success) {
        login(data.data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h1>Welcome back</h1>
        <p>Sign in to your AwardHub account</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          id="login-email"
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={HiOutlineMail}
          required
        />
        <Input
          id="login-password"
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          icon={HiOutlineLockClosed}
          required
        />

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sign In
        </Button>
      </form>

      <div className="auth-form-footer">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </AuthLayout>
  );
}
