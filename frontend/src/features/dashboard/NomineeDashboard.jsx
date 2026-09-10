import {
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineUserCircle,
} from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const stats = [
  { icon: HiOutlineDocumentText, label: 'My Nominations', value: '5', color: 'primary' },
  { icon: HiOutlineCheckCircle, label: 'Approved', value: '3', color: 'success' },
  { icon: HiOutlineClock, label: 'Under Review', value: '1', color: 'info' },
  { icon: HiOutlineUserCircle, label: 'Profile Completion', value: '85%', color: 'accent' },
];

const nominations = [
  { id: 1, title: 'Outstanding Research Innovation', category: 'Research Excellence', status: 'Approved', date: '2026-09-01' },
  { id: 2, title: 'Community Health Initiative', category: 'Community Impact', status: 'Under Review', date: '2026-09-05' },
  { id: 3, title: 'Sustainable Agriculture Project', category: 'Environmental Leadership', status: 'Approved', date: '2026-08-28' },
  { id: 4, title: 'Digital Learning Platform', category: 'Technology Innovation', status: 'Draft', date: '2026-09-08' },
  { id: 5, title: 'Youth Mentorship Program', category: 'Education Excellence', status: 'Approved', date: '2026-08-20' },
];

export default function NomineeDashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Track your nominations and profile status</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <Card title="My Nominations" subtitle="All your submitted nominations">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {nominations.map((nom) => (
            <div
              key={nom.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--slate-100)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--slate-50)';
                e.currentTarget.style.borderColor = 'var(--slate-200)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--slate-100)';
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: 'var(--font-sm)' }}>{nom.title}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)', marginTop: 2 }}>{nom.category} · {nom.date}</div>
              </div>
              <Badge status={nom.status} />
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
