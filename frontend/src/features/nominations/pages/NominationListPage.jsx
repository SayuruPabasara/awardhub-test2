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

const DEFAULT_MOCK_NOMINATIONS = [
  {
    nominationId: 1,
    title: 'Autonomous Drone Navigation for Search & Rescue',
    nomineeName: 'Dr. Sarah Chen',
    nomineeEmail: 'sarah.chen@university.edu',
    categoryId: 1,
    categoryName: 'Outstanding Research Innovation',
    status: 'SUBMITTED',
    submissionDate: '2026-09-08T14:30:00',
    documents: [
      { documentId: 101, documentType: 'RESUME', fileName: 'sarah_chen_cv.pdf' },
      { documentId: 102, documentType: 'PROJECT_REPORT', fileName: 'drone_nav_tech_report.pdf' },
    ],
  },
  {
    nominationId: 2,
    title: 'Rural Clean Water Filtration Network',
    nomineeName: 'James Rodriguez',
    nomineeEmail: 'j.rodriguez@ecoaid.org',
    categoryId: 2,
    categoryName: 'Community Impact & Leadership',
    status: 'APPROVED',
    submissionDate: '2026-09-05T09:15:00',
    documents: [
      { documentId: 103, documentType: 'RESUME', fileName: 'rodriguez_resume.pdf' },
      { documentId: 104, documentType: 'PORTFOLIO', fileName: 'cleanwater_portfolio.pdf' },
    ],
  },
  {
    nominationId: 3,
    title: 'Adaptive Learning Interface for Neurodivergent Children',
    nomineeName: 'Aisha Patel',
    nomineeEmail: 'aisha.p@techlabs.io',
    categoryId: 3,
    categoryName: 'Technology Innovation of the Year',
    status: 'UNDER_REVIEW',
    submissionDate: '2026-09-07T18:40:00',
    documents: [
      { documentId: 105, documentType: 'PROJECT_REPORT', fileName: 'adaptive_learning_whitepaper.pdf' },
      { documentId: 106, documentType: 'PORTFOLIO', fileName: 'system_architecture.pdf' },
      { documentId: 107, documentType: 'RECOMMENDATION_LETTER', fileName: 'dean_rec_letter.pdf' },
    ],
  },
  {
    nominationId: 4,
    title: 'Solar Thermal Desalination Unit',
    nomineeName: 'Michael Okonkwo',
    nomineeEmail: 'm.okonkwo@greenfuture.ng',
    categoryId: 1,
    categoryName: 'Outstanding Research Innovation',
    status: 'REJECTED',
    submissionDate: '2026-09-01T11:20:00',
    rejectionReason: 'Submission lacked mandatory university endorsement document.',
    documents: [
      { documentId: 108, documentType: 'RESUME', fileName: 'cv_okonkwo.pdf' },
    ],
  },
];

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

      if (res?.data?.data && res.data.data.length > 0) {
        setNominations(res.data.data);
      } else {
        setNominations(DEFAULT_MOCK_NOMINATIONS);
      }
    } catch (err) {
      console.warn('API error, loading mock nominations:', err);
      setNominations(DEFAULT_MOCK_NOMINATIONS);
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
      console.error(err);
      toast.error('Failed to submit review on server, updating locally');
      setNominations((prev) =>
        prev.map((n) =>
          n.nominationId === reviewingNomination.nominationId
            ? { ...n, status: reviewData.decision, rejectionReason: reviewData.rejectionReason }
            : n
        )
      );
      setReviewModalOpen(false);
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
      console.error(err);
      toast.error('Failed on server, withdrawing locally');
      setNominations((prev) =>
        prev.map((n) => (n.nominationId === id ? { ...n, status: 'WITHDRAWN' } : n))
      );
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
      header: 'Title & Nominee',
      accessor: 'title',
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
      header: 'Award Category',
      accessor: 'categoryName',
      render: (val) => (
        <span style={{ fontSize: 'var(--font-xs)', fontWeight: 500, color: 'var(--primary-700)' }}>
          {val}
        </span>
      ),
    },
    {
      header: 'Documents',
      accessor: 'documents',
      render: (docs) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-xs)', color: 'var(--slate-600)' }}>
          <HiOutlinePaperClip size={14} color="var(--slate-400)" />
          <span>{docs?.length || 0} attached</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (val) => getStatusBadge(val),
    },
    {
      header: 'Actions',
      accessor: 'nominationId',
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
          title="No nominations found"
          description="There are no nomination submissions matching your selected filter."
          actionLabel={isNominee ? 'Submit Your First Nomination' : null}
          onAction={isNominee ? () => navigate('/nominations/new') : null}
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
