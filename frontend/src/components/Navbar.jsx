import { Link, useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import './Navbar.css';

export default function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch {
      // even if the request fails, clear client state and redirect
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home" className="brand-link">
          <span className="brand-icon">🛒</span>
          <span className="brand-text">ShopKart</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user && (
          <span className="navbar-greeting">
            Hey, <strong>{user.fullName?.split(' ')[0]}</strong>
          </span>
        )}
        <button
          id="logout-btn"
          className="logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <span className="logout-icon">⏻</span>
          Logout
        </button>
      </div>
    </nav>
  );
}
