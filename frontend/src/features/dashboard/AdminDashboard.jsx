import {
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineServer,
  HiOutlineExclamation,
} from 'react-icons/hi';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Table from '../../components/Table';

const stats = [
  { icon: HiOutlineUsers, label: 'Total Users', value: '342', trend: '+18 this week', trendUp: true, color: 'primary' },
  { icon: HiOutlineShieldCheck, label: 'Active Sessions', value: '47', color: 'success' },
  { icon: HiOutlineServer, label: 'System Status', value: 'Healthy', color: 'info' },
  { icon: HiOutlineExclamation, label: 'Alerts', value: '2', color: 'danger' },
];

const recentLogs = [
  { id: 1, action: 'User Registration', user: 'john@example.com', role: 'Voter', timestamp: '2026-09-10 09:45', status: 'Active' },
  { id: 2, action: 'Nomination Approved', user: 'org@awardhub.com', role: 'Organizer', timestamp: '2026-09-10 09:32', status: 'Active' },
  { id: 3, action: 'Vote Cast', user: 'voter123@mail.com', role: 'Voter', timestamp: '2026-09-10 09:15', status: 'Active' },
  { id: 4, action: 'Account Suspended', user: 'spam@test.com', role: 'Voter', timestamp: '2026-09-10 08:50', status: 'Suspended' },
  { id: 5, action: 'Evaluation Submitted', user: 'judge@uni.edu', role: 'Judge', timestamp: '2026-09-10 08:30', status: 'Active' },
];

const logColumns = [
  { key: 'action', label: 'Action', sortable: true },
  { key: 'user', label: 'User', sortable: true },
  { key: 'role', label: 'Role' },
  { key: 'timestamp', label: 'Time', sortable: true },
  { key: 'status', label: 'Status', render: (val) => <Badge status={val} /> },
];

export default function AdminDashboard() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-text">
          <h1>Dashboard</h1>
          <p>System overview and administration</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <Card title="Recent Audit Log" subtitle="Latest system activity" noPadding>
        <Table columns={logColumns} data={recentLogs} pageSize={5} />
      </Card>
    </>
  );
}
