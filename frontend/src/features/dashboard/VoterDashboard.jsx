import {
  HiOutlineThumbUp,
  HiOutlineCollection,
  HiOutlineCalendar,
  HiOutlineCheckCircle,
} from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const stats = [
  { icon: HiOutlineCollection, label: 'Active Categories', value: '6', color: 'primary' },
  { icon: HiOutlineThumbUp, label: 'Votes Cast', value: '4', color: 'success' },
  { icon: HiOutlineCalendar, label: 'Days Left to Vote', value: '12', color: 'accent' },
  { icon: HiOutlineCheckCircle, label: 'Verified', value: 'Yes', color: 'info' },
];

const categories = [
  { id: 1, name: 'Research Excellence', nominees: 15, deadline: '2026-09-20', voted: true },
  { id: 2, name: 'Community Impact', nominees: 12, deadline: '2026-09-22', voted: true },
  { id: 3, name: 'Technology Innovation', nominees: 18, deadline: '2026-09-25', voted: false },
  { id: 4, name: 'Environmental Leadership', nominees: 9, deadline: '2026-09-20', voted: false },
  { id: 5, name: 'Education Excellence', nominees: 14, deadline: '2026-09-28', voted: true },
  { id: 6, name: 'Arts & Culture', nominees: 11, deadline: '2026-09-30', voted: true },
];

export default function VoterDashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Browse categories and cast your votes</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <Card title="Voting Categories" subtitle="Active categories open for voting">
        <div className="grid grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                padding: 'var(--space-5)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-300)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--slate-200)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <h4 style={{ fontSize: 'var(--font-base)', fontWeight: 600, color: 'var(--slate-800)' }}>{cat.name}</h4>
                {cat.voted ? <Badge status="Approved">Voted</Badge> : <Badge variant="warning">Pending</Badge>}
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-500)' }}>
                {cat.nominees} nominees · Closes {cat.deadline}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
