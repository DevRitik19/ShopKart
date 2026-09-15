import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginCustomer } from '../services/api';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Show a success banner if they just registered
  const justRegistered = location.state?.registered;

  const validate = () => {
    const e = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await loginCustomer(form);   // cookie is set by the server automatically
      navigate('/home');
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 400) {
        setServerError('Invalid Credentials. Please check your email and password.');
      } else {
        setServerError(err.response?.data?.message || 'Login failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your ShopKart account</p>
        </div>

        {/* Registration success banner */}
        {justRegistered && (
          <div className="alert alert-success" role="status">
            🎉 Account created! Please sign in.
          </div>
        )}

        {/* Invalid credentials error */}
        {serverError && (
          <div className="alert alert-error" role="alert">
            ⚠️ {serverError}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="field-group">
            <label htmlFor="email" className="field-label">
              Email Address
            </label>
            <div className={`input-wrapper ${errors.email ? 'has-error' : ''}`}>
              <span className="input-icon">✉️</span>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange}
                className="auth-input"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="field-group">
            <label htmlFor="password" className="field-label">
              Password
            </label>
            <div className={`input-wrapper ${errors.password ? 'has-error' : ''}`}>
              <span className="input-icon">🔒</span>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                autoComplete="current-password"
              />
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
