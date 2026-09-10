import { NavLink } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineUserCircle,
  HiOutlineThumbUp,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineCog,
  HiOutlineAnnotation,
  HiMenuAlt2,
  HiChevronLeft,
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const roleMenus = {
  AWARD_ORGANIZER: [
    { section: 'Main' },
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { section: 'Management' },
    { to: '/categories', icon: HiOutlineCollection, label: 'Categories' },
    { to: '/nominations', icon: HiOutlineDocumentText, label: 'Nominations' },
    { to: '/voting-overview', icon: HiOutlineThumbUp, label: 'Voting' },
    { to: '/evaluations', icon: HiOutlineClipboardCheck, label: 'Evaluations' },
    { to: '/results', icon: HiOutlineChartBar, label: 'Results' },
    { section: 'Insights' },
    { to: '/reports', icon: HiOutlineChartBar, label: 'Reports' },
    { to: '/feedback', icon: HiOutlineAnnotation, label: 'Feedback' },
  ],
  NOMINEE: [
    { section: 'Main' },
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { section: 'My Activity' },
    { to: '/categories', icon: HiOutlineCollection, label: 'Categories' },
    { to: '/my-profile', icon: HiOutlineUserCircle, label: 'My Profile' },
    { to: '/my-nominations', icon: HiOutlineDocumentText, label: 'My Nominations' },
  ],
  VOTER: [
    { section: 'Main' },
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { section: 'Voting' },
    { to: '/categories', icon: HiOutlineCollection, label: 'Categories' },
    { to: '/vote', icon: HiOutlineThumbUp, label: 'Cast Vote' },
  ],
  JUDGE: [
    { section: 'Main' },
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { section: 'Evaluations' },
    { to: '/my-evaluations', icon: HiOutlineClipboardCheck, label: 'My Evaluations' },
  ],
  SYSTEM_ADMINISTRATOR: [
    { section: 'Main' },
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { section: 'Administration' },
    { to: '/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/audit-log', icon: HiOutlineShieldCheck, label: 'Audit Log' },
    { to: '/system', icon: HiOutlineCog, label: 'System' },
  ],
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuth();
  const items = roleMenus[user?.role] || [];

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onMobileClose} />}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">A</div>
          <span className="sidebar-brand-text">AwardHub</span>
        </div>

        <nav className="sidebar-nav">
          {items.map((item, idx) =>
            item.section ? (
              <span key={idx} className="sidebar-section-label">{item.section}</span>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onMobileClose}
              >
                <span className="sidebar-link-icon">
                  <item.icon size={20} />
                </span>
                <span className="sidebar-link-text">{item.label}</span>
              </NavLink>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-toggle" onClick={onToggle}>
            {collapsed ? <HiMenuAlt2 size={20} /> : <HiChevronLeft size={20} />}
            <span className="sidebar-link-text">{collapsed ? '' : 'Collapse'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
