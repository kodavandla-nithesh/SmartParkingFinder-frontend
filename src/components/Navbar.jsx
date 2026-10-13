import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span>
          Smart Parking Finder
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              {user.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
              <button className="btn btn-secondary btn-small" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
