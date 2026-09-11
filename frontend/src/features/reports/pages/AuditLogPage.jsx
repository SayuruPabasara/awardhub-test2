import { useState, useEffect, useCallback } from 'react';
import { HiOutlineClipboardList, HiOutlineSearch } from 'react-icons/hi';
import { reportsApi } from '../api';
import Table from '../../../components/Table';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import './AuditLogPage.css';

const formatTimestamp = (ts) => {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
};

const getActionBadge = (action) => {
  const variantMap = {
    CREATE: 'success',
    UPDATE: 'info',
    DELETE: 'danger',
    SUBMIT: 'primary',
    REVIEW: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    RESULTS_PUBLISHED: 'accent',
    VOTE: 'primary',
  };
  const prefix = action?.split('_')[0];
  const variant = variantMap[prefix] || variantMap[action] || 'neutral';
  return <Badge variant={variant}>{action}</Badge>;
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportsApi.getAuditLogs(0, 200);
      const data = res.data?.data?.content || res.data?.data || [];
      setLogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredLogs = logs.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.userEmail?.toLowerCase().includes(q) ||
      l.actionType?.toLowerCase().includes(q) ||
      l.entityType?.toLowerCase().includes(q) ||
      l.details?.toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: true,
      width: '180px',
      render: (ts) => <span className="audit-timestamp">{formatTimestamp(ts)}</span>,
    },
    {
      key: 'userEmail',
      label: 'User',
      sortable: true,
      render: (email) => email || 'System',
    },
    {
      key: 'actionType',
      label: 'Action',
      sortable: true,
      render: (action) => getActionBadge(action),
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (type) => type || '—',
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      render: (id) => id ?? '—',
    },
    {
      key: 'details',
      label: 'Details',
      render: (details) => <span className="audit-details">{details || '—'}</span>,
    },
  ];

  if (loading) return <Loader text="Loading audit logs..." />;

  if (error) {
    return (
      <EmptyState
        icon={HiOutlineClipboardList}
        title="Could not load audit logs"
        message={error}
        action={<button className="btn btn-primary" onClick={loadData}>Retry</button>}
      />
    );
  }

  return (
    <div className="audit-log-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Audit Log</h1>
          <p>System-wide activity trail — every create, update, review, and publish action.</p>
        </div>
      </div>

      <div className="audit-search-bar">
        <HiOutlineSearch size={16} className="audit-search-icon" />
        <input
          type="text"
          placeholder="Search by user, action, or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="audit-search-input"
        />
      </div>

      <Table
        columns={columns}
        data={filteredLogs}
        pageSize={15}
        emptyTitle="No audit entries found"
        emptyMessage="There are no audit log entries matching your search criteria."
      />
    </div>
  );
}
