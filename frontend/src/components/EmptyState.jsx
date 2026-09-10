import { HiOutlineInbox } from 'react-icons/hi';
import './EmptyState.css';

export default function EmptyState({ icon: Icon = HiOutlineInbox, title = 'No data found', message, action }) {
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state-icon">
        <Icon size={48} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      {message && <p className="empty-state-message">{message}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
