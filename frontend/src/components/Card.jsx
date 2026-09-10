import './Card.css';

export default function Card({ title, subtitle, actions, children, className = '', noPadding = false }) {
  return (
    <div className={`card animate-fade-in-up ${className}`}>
      {(title || actions) && (
        <div className="card-header">
          <div className="card-header-text">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${noPadding ? 'card-body-flush' : ''}`}>
        {children}
      </div>
    </div>
  );
}
