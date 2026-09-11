import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineThumbUp,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineEye,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { categoryApi } from '../api';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import EmptyState from '../../../components/EmptyState';
import Loader from '../../../components/Loader';
import CategoryFormModal from '../components/CategoryFormModal';
import './CategoryListPage.css';

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Categories' },
  { id: 'NOMINATIONS_OPEN', label: 'Nominations Open' },
  { id: 'VOTING_OPEN', label: 'Voting Open' },
  { id: 'UPCOMING', label: 'Upcoming' },
  { id: 'UNDER_EVALUATION', label: 'In Evaluation' },
  { id: 'PUBLISHED', label: 'Results Ready' },
  { id: 'DRAFT', label: 'Drafts' },
];

export default function CategoryListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOrganizerOrAdmin =
    user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';
  const isNominee = user?.role === 'NOMINEE';
  const isVoter = user?.role === 'VOTER';

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryApi.getAll(activeTab !== 'ALL' ? activeTab : null);
      setCategories(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeTab]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (editingCategory) {
        await categoryApi.update(editingCategory.categoryId, formData);
        toast.success('Category updated successfully!');
      } else {
        await categoryApi.create(formData);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await categoryApi.delete(id);
      toast.success('Category deleted');
      setCategories((prev) => prev.filter((c) => c.categoryId !== id));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NOMINATIONS_OPEN':
        return <Badge variant="success">Nominations Open</Badge>;
      case 'VOTING_OPEN':
        return <Badge variant="primary">Voting Open</Badge>;
      case 'UNDER_EVALUATION':
        return <Badge variant="warning">Under Evaluation</Badge>;
      case 'UPCOMING':
        return <Badge variant="neutral">Upcoming</Badge>;
      case 'PUBLISHED':
        return <Badge variant="accent">Results Ready</Badge>;
      case 'DRAFT':
        return <Badge variant="neutral">Draft</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const filteredCategories = categories.filter((c) => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const matchesSearch =
      c.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="category-page-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-text">
          <h1>Award Categories</h1>
          <p>Explore all award categories, schedules, evaluation criteria, and document requirements.</p>
        </div>
        {isOrganizerOrAdmin && (
          <div className="category-header-actions">
            <Button
              variant="primary"
              icon={HiOutlinePlus}
              onClick={handleOpenCreateModal}
            >
              New Category
            </Button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="category-filter-bar">
        <div className="category-tabs">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.id}
              className={`category-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="category-search-input">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ height: '36px', fontSize: 'var(--font-sm)' }}
          />
        </div>
      </div>

      {/* Category Grid or Loader */}
      {loading ? (
        <Loader text="Loading award categories..." />
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          title="No categories found"
          message="There are no categories matching your current filter or search criteria."
          action={isOrganizerOrAdmin ? <Button variant="primary" icon={HiOutlinePlus} onClick={handleOpenCreateModal}>Create New Category</Button> : null}
        />
      ) : (
        <div className="category-grid">
          {filteredCategories.map((cat) => (
            <div key={cat.categoryId} className="category-card">
              <div className="category-card-header">
                <div>
                  <h3 className="category-card-title">{cat.categoryName}</h3>
                </div>
                {getStatusBadge(cat.status)}
              </div>

              <div className="category-card-body">
                <p className="category-card-desc">{cat.description || 'No description provided.'}</p>

                <div className="category-meta-row">
                  <span>
                    <strong>Method:</strong>{' '}
                    {cat.evaluationMethod === 'HYBRID'
                      ? `Hybrid (${cat.votingWeightage || 50}% Vote / ${cat.judgingWeightage || 50}% Judge)`
                      : cat.evaluationMethod === 'VOTING_ONLY'
                      ? 'Public Vote (100%)'
                      : 'Judge Scoring (100%)'}
                  </span>
                  <span>Max Votes: {cat.maxVotesPerVoter || 1}</span>
                </div>

                <div className="category-dates-group">
                  <div className="category-date-item">
                    <HiOutlineCalendar size={14} color="var(--slate-400)" />
                    <span className="category-date-label">Nomination Deadline:</span>
                    <span className="category-date-value">{formatDate(cat.nominationDeadline)}</span>
                  </div>
                  <div className="category-date-item">
                    <HiOutlineCalendar size={14} color="var(--slate-400)" />
                    <span className="category-date-label">Voting Window:</span>
                    <span className="category-date-value">
                      {formatDate(cat.votingStartDate)} – {formatDate(cat.votingEndDate)}
                    </span>
                  </div>
                </div>

                {cat.requiredDocumentTypes && cat.requiredDocumentTypes.length > 0 && (
                  <div>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)', display: 'block', marginBottom: '4px' }}>
                      Required Documents:
                    </span>
                    <div className="category-doc-tags">
                      {cat.requiredDocumentTypes.map((doc, idx) => (
                        <span key={idx} className="category-doc-tag">
                          {doc.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="category-card-footer">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={HiOutlineEye}
                  onClick={() => navigate(`/categories/${cat.categoryId}`)}
                >
                  View Details
                </Button>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {isNominee && cat.status === 'NOMINATIONS_OPEN' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={HiOutlineDocumentText}
                      onClick={() => navigate(`/nominations/new?category=${cat.categoryId}`)}
                    >
                      Nominate
                    </Button>
                  )}

                  {isVoter && cat.status === 'VOTING_OPEN' && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={HiOutlineThumbUp}
                      onClick={() => navigate(`/vote?category=${cat.categoryId}`)}
                    >
                      Vote Now
                    </Button>
                  )}

                  {isOrganizerOrAdmin && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={HiOutlinePencilAlt}
                        onClick={() => handleOpenEditModal(cat)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={HiOutlineTrash}
                        onClick={() => handleDelete(cat.categoryId, cat.categoryName)}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingCategory}
        isLoading={isSubmitting}
      />
    </div>
  );
}
