import { useState, useEffect, useCallback } from 'react';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineUsers,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { userApi } from '../api';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Table from '../../../components/Table';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import './UserManagementPage.css';

const ROLE_FILTERS = [
  { id: 'ALL', label: 'All Users' },
  { id: 'NOMINEE', label: 'Nominees' },
  { id: 'VOTER', label: 'Voters' },
  { id: 'JUDGE', label: 'Judges' },
  { id: 'AWARD_ORGANIZER', label: 'Organizers' },
  { id: 'SYSTEM_ADMINISTRATOR', label: 'Admins' },
];

const ROLE_OPTIONS = [
  { value: 'NOMINEE', label: 'Nominee' },
  { value: 'VOTER', label: 'Voter' },
  { value: 'JUDGE', label: 'Judge' },
  { value: 'AWARD_ORGANIZER', label: 'Award Organizer' },
  { value: 'SYSTEM_ADMINISTRATOR', label: 'System Administrator' },
];

const STATUS_OPTIONS = [
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
];

const formatRole = (role) =>
  role ? role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const getStatusBadge = (status) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success">Active</Badge>;
    case 'PENDING_VERIFICATION':
      return <Badge variant="warning">Pending</Badge>;
    case 'SUSPENDED':
      return <Badge variant="danger">Suspended</Badge>;
    case 'DEACTIVATED':
      return <Badge variant="neutral">Deactivated</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'SYSTEM_ADMINISTRATOR';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    contactNumber: '',
    role: 'NOMINEE',
    accountStatus: 'ACTIVE',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let data;
      if (activeTab !== 'ALL') {
        const res = await userApi.getByRole(activeTab);
        data = res.data?.data || [];
      } else {
        const res = await userApi.getAll(0, 200);
        data = res.data?.data?.content || res.data?.data || [];
      }
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ email: '', password: '', contactNumber: '', role: 'NOMINEE', accountStatus: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      contactNumber: user.contactNumber || '',
      role: user.role || 'NOMINEE',
      accountStatus: user.accountStatus || 'ACTIVE',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingUser) {
        await userApi.update(editingUser.userID, {
          contactNumber: formData.contactNumber,
          accountStatus: formData.accountStatus,
        });
        toast.success('User updated successfully!');
      } else {
        await userApi.create({
          email: formData.email,
          password: formData.password,
          contactNumber: formData.contactNumber,
          role: formData.role,
        });
        toast.success('User created successfully!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user "${email}"?`)) return;
    try {
      await userApi.delete(userId);
      toast.success('User deleted');
      setUsers((prev) => prev.filter((u) => u.userID !== userId));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.contactNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const columns = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (role) => <span className="um-role-cell">{formatRole(role)}</span>,
    },
    {
      key: 'contactNumber',
      label: 'Contact',
      render: (val) => val || '—',
    },
    {
      key: 'accountStatus',
      label: 'Status',
      sortable: true,
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (_, row) => (
        <div className="um-actions">
          <Button
            variant="ghost"
            size="sm"
            icon={HiOutlinePencilAlt}
            onClick={() => handleOpenEdit(row)}
          />
          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              icon={HiOutlineTrash}
              onClick={() => handleDelete(row.userID, row.email)}
              disabled={row.userID === currentUser?.userID}
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>User Management</h1>
          <p>Manage all system users — nominees, voters, judges, organizers, and administrators.</p>
        </div>
        {isAdmin && (
          <Button variant="primary" icon={HiOutlinePlus} onClick={handleOpenCreate}>
            Add User
          </Button>
        )}
      </div>

      <div className="um-filter-bar">
        <div className="um-tabs">
          {ROLE_FILTERS.map((tab) => (
            <button
              key={tab.id}
              className={`um-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="um-search">
          <HiOutlineSearch size={16} className="um-search-icon" />
          <input
            type="text"
            placeholder="Search by email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="um-search-input"
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading users..." />
      ) : error ? (
        <EmptyState
          icon={HiOutlineUsers}
          title="Could not load users"
          message={error}
          action={<Button onClick={fetchUsers}>Retry</Button>}
        />
      ) : (
        <Table
          columns={columns}
          data={filteredUsers}
          pageSize={10}
          emptyTitle="No users found"
          emptyMessage="There are no users matching your current filter or search criteria."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User' : 'Create New User'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" loading={isSubmitting} onClick={handleSubmit}>
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </>
        }
      >
        <form className="um-form" onSubmit={handleSubmit}>
          <div className="um-form-group">
            <label className="um-label">Email</label>
            <input
              type="email"
              className="um-input"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              disabled={!!editingUser}
              required
            />
          </div>

          {!editingUser && (
            <div className="um-form-group">
              <label className="um-label">Password</label>
              <input
                type="password"
                className="um-input"
                value={formData.password}
                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={8}
              />
            </div>
          )}

          <div className="um-form-row">
            <div className="um-form-group">
              <label className="um-label">Contact Number</label>
              <input
                type="text"
                className="um-input"
                value={formData.contactNumber}
                onChange={(e) => setFormData((p) => ({ ...p, contactNumber: e.target.value }))}
                required
              />
            </div>

            {!editingUser ? (
              <div className="um-form-group">
                <label className="um-label">Role</label>
                <select
                  className="um-input"
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  required
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="um-form-group">
                <label className="um-label">Account Status</label>
                <select
                  className="um-input"
                  value={formData.accountStatus}
                  onChange={(e) => setFormData((p) => ({ ...p, accountStatus: e.target.value }))}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
