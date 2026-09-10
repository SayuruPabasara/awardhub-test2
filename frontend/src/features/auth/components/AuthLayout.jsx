import {
  HiOutlineDocumentText,
  HiOutlineThumbUp,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
} from 'react-icons/hi';
import './AuthLayout.css';

const features = [
  { icon: HiOutlineDocumentText, text: 'Streamlined nomination submissions' },
  { icon: HiOutlineThumbUp, text: 'Secure, verified public voting' },
  { icon: HiOutlineClipboardCheck, text: 'Rubric-based expert evaluations' },
  { icon: HiOutlineChartBar, text: 'Automated scoring & analytics' },
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      <div className="auth-brand-panel">
        <div className="auth-brand-content">
          <div className="auth-brand-logo">A</div>
          <h1 className="auth-brand-title">AwardHub</h1>
          <p className="auth-brand-subtitle">
            The centralized platform for managing award nominations, voting, and evaluations.
          </p>
          <div className="auth-brand-features">
            {features.map((f, i) => (
              <div key={i} className="auth-brand-feature">
                <span className="auth-brand-feature-icon"><f.icon size={16} /></span>
                {f.text}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
}
