import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCustomer } from '../services/api';
import './Auth.css';

const INITIAL = { fullName: '', email: '', password: '', phone: '' };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Enter a valid email address.';
    if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (!form.phone.match(/^\+?[\d\s\-]{7,15}$/))
      e.phone = 'Enter a valid phone number.';
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
      await registerCustomer(form);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="auth-page">
      {/* Animated background blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join ShopKart and start shopping today</p>
        </div>

        {/* Server-level error */}
        {serverError && (
          <div className="alert alert-error" role="alert">
            ⚠️ {serverError}
          </div>
        )}

        <form id="register-form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="field-group">
            <label htmlFor="fullName" className="field-label">
              Full Name
            </label>
            <div className={`input-wrapper ${errors.fullName ? 'has-error' : ''}`}>
              <span className="input-icon">👤</span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                className="auth-input"
                autoComplete="name"
              />
            </div>
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                className="auth-input"
                autoComplete="new-password"
              />
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          {/* Phone */}
          <div className="field-group">
            <label htmlFor="phone" className="field-label">
              Phone Number
            </label>
            <div className={`input-wrapper ${errors.phone ? 'has-error' : ''}`}>
              <span className="input-icon">📱</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                className="auth-input"
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <p className="field-error">{errors.phone}</p>
            )}
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
