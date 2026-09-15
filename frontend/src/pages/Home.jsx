import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/api';
import Navbar from '../components/Navbar';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        // Backend returns { _id, fullName, email, phone } directly
        setCustomer(res.data);
      } catch (err) {
        // Not authenticated → redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <div className="home-loading">
        <span className="spinner large" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  const initials = customer?.fullName
    ? customer.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const joinedDate = customer?.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <>
      <Navbar user={customer} />

      <main className="home-page">
        {/* Ambient blobs */}
        <div className="bg-blob blob-1" />
        <div className="bg-blob blob-2" />

        {/* Welcome hero */}
        <section className="hero-section">
          <div className="welcome-badge">✨ You&apos;re logged in</div>
          <h1 className="welcome-heading">
            Welcome back,{' '}
            <span className="gradient-name">
              {customer?.fullName?.split(' ')[0] ?? 'Customer'}!
            </span>
          </h1>
          <p className="welcome-sub">
            Here&apos;s your ShopKart profile information.
          </p>
        </section>

        {/* Profile card */}
        <section className="profile-section">
          <div className="profile-card">
            {/* Avatar */}
            <div className="avatar-ring">
              <div className="avatar">{initials}</div>
            </div>

            <h2 className="profile-name">{customer?.fullName}</h2>
            <p className="profile-role">ShopKart Customer</p>

            {/* Info grid */}
            <div className="info-grid">
              <div className="info-tile">
                <span className="tile-icon">✉️</span>
                <div className="tile-body">
                  <p className="tile-label">Email</p>
                  <p className="tile-value">{customer?.email}</p>
                </div>
              </div>

              <div className="info-tile">
                <span className="tile-icon">📱</span>
                <div className="tile-body">
                  <p className="tile-label">Phone</p>
                  <p className="tile-value">{customer?.phone ?? '—'}</p>
                </div>
              </div>

              <div className="info-tile">
                <span className="tile-icon">🗓️</span>
                <div className="tile-body">
                  <p className="tile-label">Member Since</p>
                  <p className="tile-value">{joinedDate}</p>
                </div>
              </div>

              <div className="info-tile">
                <span className="tile-icon">🛡️</span>
                <div className="tile-body">
                  <p className="tile-label">Account Status</p>
                  <p className="tile-value status-active">Active</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
