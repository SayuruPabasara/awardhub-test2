import './Badge.css';

const variantMap = {
  approved: 'badge-success',
  active: 'badge-success',
  pending: 'badge-warning',
  'under-review': 'badge-info',
  rejected: 'badge-danger',
  draft: 'badge-neutral',
  suspended: 'badge-danger',
  published: 'badge-accent',
};

export default function Badge({ status, variant, children, className = '' }) {
  const variantClass = variant
    ? `badge-${variant}`
    : variantMap[status?.toLowerCase()] || 'badge-neutral';

  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children || status}
    </span>
  );
}
