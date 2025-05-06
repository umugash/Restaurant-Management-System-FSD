import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine nav links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard' },
          { to: '/admin/users', label: 'Users' },
          { to: '/admin/tables', label: 'Tables' },
          { to: '/admin/reservations', label: 'Reservations' },
          { to: '/admin/orders', label: 'Orders' },
          { to: '/admin/groceries', label: 'Inventory' },
        ];
      case 'receptionist':
        return [
          { to: '/receptionist', label: 'Dashboard' },
          { to: '/receptionist/reservations', label: 'Reservations' },
          { to: '/receptionist/calendar', label: 'Calendar' },
        ];
      case 'waiter':
        return [
          { to: '/waiter', label: 'Dashboard' },
          { to: '/waiter/tables', label: 'Tables' },
          { to: '/waiter/orders', label: 'Orders' },
        ];
      case 'chef':
        return [
          { to: '/chef', label: 'Dashboard' },
          { to: '/chef/groceries', label: 'Inventory' },
          { to: '/chef/orders', label: 'Orders' },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="header">
      <div className="navbar">
        <Link to="/" className="navbar-brand">
          Restaurant MS
        </Link>
        
        {user && (
          <>
            <ul className="navbar-menu">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
            
            <div className="user-info">
              <div className="flex items-center">
                <FaUser />
                <span className="ml-2">{user.name}</span>
                <span className="badge ml-2" style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  marginLeft: '8px'
                }}>
                  {user.role}
                </span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                <FaSignOutAlt style={{ marginRight: '5px' }} />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;