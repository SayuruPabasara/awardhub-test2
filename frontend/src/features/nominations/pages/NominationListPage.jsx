import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlinePaperClip,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { nominationApi } from '../api';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Table from '../../../components/Table';
import EmptyState from '../../../components/EmptyState';
import Loader from '../../../components/Loader';
import NominationReviewModal from '../components/NominationReviewModal';
import './NominationListPage.css';

const STATUS_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'SUBMITTED', label: 'Submitted' },
  { id: 'UNDER_REVIEW', label: 'Under Review' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'DRAFT', label: 'Drafts' },
];

export default function NominationListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isNominee = user?.role === 'NOMINEE';
  const isOrganizerOrAdmin =
    user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';

  const [nominations, setNominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingNomination, setReviewingNomination] = useState(null);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const fetchNominations = async () => {
    try {
      setLoading(true);
      let res;
      if (isNominee) {
        res = await nominationApi.getMy();
      } else {
        res = await nominationApi.getAll(activeTab !== 'ALL' ? activeTab : null);
      }

      setNominations(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setNominations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNominations();
  }, [activeTab, isNominee]);

  const handleOpenReview = (nom) => {
    setReviewingNomination(nom);
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      setIsReviewSubmitting(true);
      await nominationApi.review(reviewingNomination.nominationId, reviewData);
      toast.success(`Nomination ${reviewData.decision.toLowerCase()} successfully!`);
      setReviewModalOpen(false);
      fetchNominations();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleWithdraw = async (id, title) => {
    if (!window.confirm(`Are you sure you want to withdraw "${title}"?`)) return;
    try {
      await nominationApi.withdraw(id);
      toast.success('Nomination withdrawn');
      setNominations((prev) =>
        prev.map((n) => (n.nominationId === id ? { ...n, status: 'WITHDRAWN' } : n))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to withdraw nomination');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="success">Approved</Badge>;
      case 'SUBMITTED':
        return <Badge variant="primary">Submitted</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="warning">Under Review</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">Rejected</Badge>;
      case 'WITHDRAWN':
        return <Badge variant="neutral">Withdrawn</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral">Draft</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filtered = nominations.filter((n) => {
    const matchesTab = activeTab === 'ALL' || n.status === activeTab;
    const matchesSearch =
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.nomineeName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      key: 'title',
      label: 'Title & Nominee',
      render: (val, row) => (
        <div>
          <strong style={{ color: 'var(--slate-900)', fontSize: 'var(--font-sm)', display: 'block' }}>
            {val}
          </strong>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>
            by {row.nomineeName || row.nomineeEmail || 'Nominee'}
          </span>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Award Category',
      render: (val) => (
        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--primary-700)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'documents',
      label: 'Documents',
      render: (docs) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--slate-600)' }}>
          <HiOutlinePaperClip size={14} color="var(--slate-400)" />
          <span>{docs?.length || 0} attached</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => getStatusBadge(val),
    },
    {
      key: 'nominationId',
      label: 'Actions',
      render: (id, row) => (
        <div className="nomination-actions-cell">
          <Button
            variant="ghost"
            size="sm"
            icon={HiOutlineEye}
            onClick={() => navigate(`/nominations/${id}`)}
          >
            View
          </Button>

          {isOrganizerOrAdmin && (row.status === 'SUBMITTED' || row.status === 'UNDER_REVIEW') && (
            <Button
              variant="secondary"
              size="sm"
              icon={HiOutlineCheck}
              onClick={() => handleOpenReview(row)}
            >
              Review
            </Button>
          )}

          {isNominee && (row.status === 'SUBMITTED' || row.status === 'DRAFT') && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: 'var(--danger-600)' }}
              onClick={() => handleWithdraw(id, row.title)}
            >
              Withdraw
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="nomination-page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>{isNominee ? 'My Nominations' : 'Nomination Review & Submissions'}</h1>
          <p>
            {isNominee
              ? 'Track your nomination entries, uploaded documentation, and review statuses.'
              : 'Review submitted nominations, verify supporting documents, and approve or reject submissions.'}
          </p>
        </div>
        {isNominee && (
          <div>
            <Button
              variant="primary"
              icon={HiOutlinePlus}
              onClick={() => navigate('/nominations/new')}
            >
              New Nomination
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="nomination-filter-bar">
        <div className="nomination-tabs">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nomination-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ width: '260px' }}>
          <input
            type="text"
            placeholder="Search nominations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ height: '36px', fontSize: 'var(--font-sm)' }}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <Loader text="Loading nominations..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="No nominations found"
          message="There are no nomination submissions matching your selected filter."
          action={isNominee ? <Button variant="primary" icon={HiOutlinePlus} onClick={() => navigate('/nominations/new')}>Submit Your First Nomination</Button> : null}
        />
      ) : (
        <div className="nomination-table-container">
          <Table columns={columns} data={filtered} />
        </div>
      )}

      {/* Review Modal */}
      <NominationReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        nominationTitle={reviewingNomination?.title}
        isLoading={isReviewSubmitting}
      />
    </div>
  );
}
