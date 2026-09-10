import {
  HiOutlineCollection,
  HiOutlineDocumentText,
  HiOutlineThumbUp,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineExclamation,
} from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Table from '../../components/Table';

const stats = [
  { icon: HiOutlineCollection, label: 'Active Categories', value: '8', color: 'primary' },
  { icon: HiOutlineDocumentText, label: 'Total Nominations', value: '124', trend: '+12 this week', trendUp: true, color: 'accent' },
  { icon: HiOutlineThumbUp, label: 'Total Votes Cast', value: '1,847', trend: '+234 today', trendUp: true, color: 'success' },
  { icon: HiOutlineExclamation, label: 'Pending Reviews', value: '17', color: 'danger' },
];

const recentNominations = [
  { id: 1, title: 'Outstanding Research Innovation', nominee: 'Dr. Sarah Chen', category: 'Research Excellence', status: 'Under Review', date: '2026-09-08' },
  { id: 2, title: 'Community Health Initiative', nominee: 'James Rodriguez', category: 'Community Impact', status: 'Approved', date: '2026-09-07' },
  { id: 3, title: 'Digital Learning Platform', nominee: 'Aisha Patel', category: 'Technology Innovation', status: 'Pending', date: '2026-09-06' },
  { id: 4, title: 'Sustainable Agriculture Project', nominee: 'Michael Okonkwo', category: 'Environmental Leadership', status: 'Rejected', date: '2026-09-05' },
  { id: 5, title: 'Youth Mentorship Program', nominee: 'Lisa Wang', category: 'Education Excellence', status: 'Approved', date: '2026-09-04' },
];

const columns = [
  { key: 'title', label: 'Nomination', sortable: true },
  { key: 'nominee', label: 'Nominee', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'status', label: 'Status', render: (val) => <Badge status={val} /> },
  { key: 'date', label: 'Date', sortable: true },
];

export default function OrganizerDashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>Overview of your award management activity</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card title="Recent Nominations" subtitle="Latest submissions across all categories" noPadding>
          <Table columns={columns} data={recentNominations} pageSize={5} />
        </Card>

        <Card title="Quick Actions" subtitle="Frequently used operations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { icon: HiOutlineCollection, label: 'Manage Categories', desc: 'Create or edit award categories' },
              { icon: HiOutlineClipboardCheck, label: 'Review Nominations', desc: '17 nominations pending your review' },
              { icon: HiOutlineUsers, label: 'Assign Judges', desc: 'Assign judges to approved nominations' },
              { icon: HiOutlineThumbUp, label: 'View Voting Results', desc: 'Monitor live voting activity' },
            ].map((action, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'background 150ms ease',
                  border: '1px solid var(--slate-100)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--slate-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary-50)',
                  color: 'var(--primary-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <action.icon size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--font-sm)', color: 'var(--slate-800)' }}>{action.label}</div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>{action.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
