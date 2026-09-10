import './StatCard.css';

export default function StatCard({ icon: Icon, label, value, trend, trendUp, color = 'primary' }) {
  return (
    <div className={`stat-card stat-card-${color} animate-fade-in-up`}>
      <div className="stat-card-icon-wrap">
        {Icon && <Icon size={22} />}
      </div>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{value}</span>
        {trend && (
          <span className={`stat-card-trend ${trendUp ? 'trend-up' : 'trend-down'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
