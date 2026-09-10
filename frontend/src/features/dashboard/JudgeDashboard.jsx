import {
  HiOutlineClipboardCheck,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineCollection,
} from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';

const stats = [
  { icon: HiOutlineClipboardCheck, label: 'Assigned', value: '12', color: 'primary' },
  { icon: HiOutlineClock, label: 'Pending', value: '5', color: 'accent' },
  { icon: HiOutlineCheckCircle, label: 'Completed', value: '7', color: 'success' },
  { icon: HiOutlineCollection, label: 'Categories', value: '3', color: 'info' },
];

const evaluations = [
  { id: 1, nominee: 'Dr. Sarah Chen', nomination: 'Outstanding Research Innovation', category: 'Research Excellence', status: 'Pending', deadline: '2026-09-15' },
  { id: 2, nominee: 'James Rodriguez', nomination: 'Community Health Initiative', category: 'Community Impact', status: 'Completed', deadline: '2026-09-10' },
  { id: 3, nominee: 'Aisha Patel', nomination: 'Digital Learning Platform', category: 'Technology Innovation', status: 'Pending', deadline: '2026-09-18' },
  { id: 4, nominee: 'Michael Okonkwo', nomination: 'Sustainable Agriculture', category: 'Environmental Leadership', status: 'Completed', deadline: '2026-09-12' },
  { id: 5, nominee: 'Lisa Wang', nomination: 'Youth Mentorship Program', category: 'Education Excellence', status: 'Pending', deadline: '2026-09-20' },
];

export default function JudgeDashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Review and evaluate assigned nominations</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <Card title="My Evaluations" subtitle="Nominations assigned for your review">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {evaluations.map((ev) => (
            <div
              key={ev.id}
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
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: 'var(--font-sm)' }}>{ev.nomination}</div>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)', marginTop: 2 }}>
                  {ev.nominee} · {ev.category} · Due {ev.deadline}
                </div>
              </div>
              <Badge status={ev.status === 'Completed' ? 'Approved' : 'Pending'}>{ev.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
