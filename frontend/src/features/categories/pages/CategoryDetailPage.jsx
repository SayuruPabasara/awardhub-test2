import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlineCalendar,
  HiOutlineDocumentText,
  HiOutlineThumbUp,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
  HiOutlineScale,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { categoryApi } from '../api';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import CategoryFormModal from '../components/CategoryFormModal';
import './CategoryDetailPage.css';

const MOCK_DETAIL = {
  categoryId: 1,
  categoryName: 'Outstanding Research Innovation',
  description:
    'Recognizing groundbreaking research projects and publications contributing significantly to scientific progress, technology transfer, or scholarly knowledge.',
  eligibilityCriteria:
    '1. Open to full-time faculty, researchers, graduate students, or affiliated university research groups.\n2. Projects or published papers must have been developed or completed within the academic cycle (2025–2026).\n3. Must include verified documentation of findings and formal institutional endorsement.',
  nominationDeadline: '2026-09-25T23:59:00',
  votingStartDate: '2026-10-01T00:00:00',
  votingEndDate: '2026-10-15T23:59:00',
  evaluationMethod: 'HYBRID',
  votingWeightage: 40,
  judgingWeightage: 60,
  maxVotesPerVoter: 1,
  status: 'NOMINATIONS_OPEN',
  requiredDocumentTypes: ['RESUME', 'PROJECT_REPORT', 'CERTIFICATES'],
  createdAt: '2026-08-15T10:00:00',
};

export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOrganizerOrAdmin =
    user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';
  const isNominee = user?.role === 'NOMINEE';
  const isVoter = user?.role === 'VOTER';

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await categoryApi.getById(id);
        if (res?.data?.data) {
          setCategory(res.data.data);
        } else {
          setCategory(MOCK_DETAIL);
        }
      } catch (err) {
        console.warn('Failed to load category, using mock:', err);
        setCategory(MOCK_DETAIL);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await categoryApi.update(id, formData);
      toast.success('Category updated successfully');
      setCategory((prev) => ({ ...prev, ...formData }));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update on server, updating locally');
      setCategory((prev) => ({ ...prev, ...formData }));
      setIsEditModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not scheduled';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <Loader text="Loading category details..." />;
  }

  if (!category) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>Category Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/categories')} style={{ marginTop: '16px' }}>
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="category-detail-container">
      {/* Top Bar with Back and Actions */}
      <div className="category-detail-top">
        <Button
          variant="ghost"
          size="sm"
          icon={HiOutlineArrowLeft}
          onClick={() => navigate('/categories')}
        >
          Back to Categories
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isNominee && category.status === 'NOMINATIONS_OPEN' && (
            <Button
              variant="primary"
              icon={HiOutlineDocumentText}
              onClick={() => navigate(`/nominations/new?category=${category.categoryId}`)}
            >
              Submit Nomination
            </Button>
          )}

          {isVoter && category.status === 'VOTING_OPEN' && (
            <Button
              variant="primary"
              icon={HiOutlineThumbUp}
              onClick={() => navigate(`/vote?category=${category.categoryId}`)}
            >
              Cast Your Vote
            </Button>
          )}

          {isOrganizerOrAdmin && (
            <Button
              variant="secondary"
              icon={HiOutlinePencilAlt}
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Category
            </Button>
          )}
        </div>
      </div>

      {/* Main Detail Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Badge variant="primary" size="md">
              {category.status?.replace(/_/g, ' ')}
            </Badge>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-400)' }}>
              Category ID: #{category.categoryId}
            </span>
          </div>
          <h1>{category.categoryName}</h1>
          <p>{category.description}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="category-detail-grid">
        {/* Left Column: Criteria, Overview, Requirements */}
        <div className="category-detail-main">
          {/* Eligibility Criteria */}
          <Card title="Eligibility & Guidelines">
            <div style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-sm)', color: 'var(--slate-700)', lineHeight: '1.7' }}>
              {category.eligibilityCriteria || 'No explicit criteria outlined. Open to general applicants.'}
            </div>
          </Card>

          {/* Required Documents Checklist */}
          <Card title="Mandatory Submission Documents">
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)', marginBottom: 'var(--space-3)' }}>
              Nominees must provide the following documents during nomination submission. Missing documents will lead to disqualification.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {category.requiredDocumentTypes?.map((doc, idx) => (
                <div key={idx} className="doc-requirement-item">
                  <HiOutlineCheckCircle size={20} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                  <div>
                    <div className="doc-requirement-title">{doc.replace(/_/g, ' ')}</div>
                    <div className="doc-requirement-desc">
                      PDF, DOCX, or ZIP format (max 10MB). Must be authentic and signed where applicable.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Weightage & Timeline */}
        <div className="category-detail-sidebar">
          {/* Scoring Methodology */}
          <Card title="Scoring Methodology">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <HiOutlineScale size={18} color="var(--primary-600)" />
              <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-800)' }}>
                {category.evaluationMethod === 'HYBRID'
                  ? 'Hybrid Evaluation'
                  : category.evaluationMethod === 'VOTING_ONLY'
                  ? 'Public Voting Only'
                  : 'Judge Evaluation Only'}
              </strong>
            </div>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>
              {category.evaluationMethod === 'HYBRID'
                ? 'Final score is calculated by combining weighted public votes and rubric scores submitted by certified judges.'
                : category.evaluationMethod === 'VOTING_ONLY'
                ? 'The winner is determined purely by the highest number of verified public votes.'
                : 'Certified judges grade submissions against rubrics. Public votes are not included.'}
            </p>

            {category.evaluationMethod === 'HYBRID' && (
              <div className="weightage-bar-container">
                <div className="weightage-bar-track">
                  <div
                    className="weightage-segment-vote"
                    style={{ width: `${category.votingWeightage || 50}%` }}
                  />
                  <div
                    className="weightage-segment-judge"
                    style={{ width: `${category.judgingWeightage || 50}%` }}
                  />
                </div>
                <div className="weightage-labels">
                  <div className="weightage-label-item">
                    <span className="weightage-dot" style={{ background: 'var(--primary-600)' }} />
                    <span>Public Vote: {category.votingWeightage || 50}%</span>
                  </div>
                  <div className="weightage-label-item">
                    <span className="weightage-dot" style={{ background: 'var(--accent-500)' }} />
                    <span>Judges: {category.judgingWeightage || 50}%</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Schedule & Milestones */}
          <Card title="Key Milestones">
            <div className="timeline-milestones">
              <div className="timeline-step active">
                <div className="timeline-step-title">Nomination Deadline</div>
                <div className="timeline-step-date">{formatDate(category.nominationDeadline)}</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-step-title">Voting Window Starts</div>
                <div className="timeline-step-date">{formatDate(category.votingStartDate)}</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-step-title">Voting Window Closes</div>
                <div className="timeline-step-date">{formatDate(category.votingEndDate)}</div>
              </div>
              <div className="timeline-step">
                <div className="timeline-step-title">Winner Publication</div>
                <div className="timeline-step-date">Following Organizer Review</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <CategoryFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={category}
        isLoading={isSubmitting}
      />
    </div>
  );
}
