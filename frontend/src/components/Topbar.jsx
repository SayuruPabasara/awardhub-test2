import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlineBell,
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiMenuAlt2,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Topbar.css';

const roleLabels = {
  NOMINEE: 'Nominee',
  VOTER: 'Voter',
  JUDGE: 'Judge',
  AWARD_ORGANIZER: 'Organizer',
  SYSTEM_ADMINISTRATOR: 'Admin',
};

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/categories': 'Award Categories',
  '/nominations': 'Nominations',
  '/my-nominations': 'My Nominations',
  '/my-profile': 'My Profile',
  '/vote': 'Cast Vote',
  '/voting-overview': 'Voting Overview',
  '/my-evaluations': 'My Evaluations',
  '/evaluations': 'Evaluations',
  '/results': 'Results',
  '/reports': 'Reports',
  '/feedback': 'Feedback',
  '/users': 'User Management',
  '/audit-log': 'Audit Log',
  '/system': 'System Settings',
};

export default function Topbar({ sidebarCollapsed, onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = routeTitles[location.pathname] || 'AwardHub';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className={`topbar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMobileMenuToggle} aria-label="Toggle menu">
          <HiMenuAlt2 size={22} />
        </button>
        <div className="topbar-breadcrumb">
          <span>{pageTitle}</span>
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <HiOutlineBell size={20} />
          <span className="topbar-notification-dot" />
        </button>

        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <div
            className="topbar-user"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="topbar-avatar">{initials}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.email || 'User'}</span>
              <span className="topbar-user-role">{roleLabels[user?.role] || user?.role}</span>
            </div>
          </div>

          {dropdownOpen && (
            <div className="topbar-dropdown">
              <button
                className="topbar-dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate('/my-profile'); }}
              >
                <HiOutlineUserCircle size={18} />
                Profile
              </button>
              <div className="topbar-dropdown-divider" />
              <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                <HiOutlineLogout size={18} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
