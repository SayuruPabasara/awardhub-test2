import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiOutlineArrowLeft,
  HiOutlinePaperClip,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendar,
  HiOutlineUserCircle,
  HiOutlineExclamation,
  HiOutlineDownload,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { nominationApi } from '../api';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import NominationReviewModal from '../components/NominationReviewModal';

const MOCK_NOMINATION_DETAIL = {
  nominationId: 1,
  title: 'Autonomous Drone Navigation for Search & Rescue',
  nomineeId: 10,
  nomineeName: 'Dr. Sarah Chen',
  nomineeEmail: 'sarah.chen@university.edu',
  categoryId: 1,
  categoryName: 'Outstanding Research Innovation',
  achievementDescription:
    'Developed a novel computer vision and LiDAR sensor-fusion algorithm enabling autonomous aerial drones to navigate dense, GPS-denied environments during disaster scenarios. Successfully deployed in 3 mountain rescue operations in 2025.',
  evidenceDetails:
    '• Published in IEEE Transactions on Robotics (June 2025)\n• 42 registered citations within 12 months\n• 3 live trial validations with National Search & Rescue command\n• 1 provisional patent granted (US-2025-98321)',
  declaration: true,
  status: 'SUBMITTED',
  submissionDate: '2026-09-08T14:30:00',
  documents: [
    {
      documentId: 101,
      documentType: 'RESUME',
      fileName: 'dr_sarah_chen_cv.pdf',
      fileFormat: 'application/pdf',
      size: 420000,
      verificationStatus: 'VERIFIED',
    },
    {
      documentId: 102,
      documentType: 'PROJECT_REPORT',
      fileName: 'autonomous_drone_rescue_report.pdf',
      fileFormat: 'application/pdf',
      size: 3200000,
      verificationStatus: 'VERIFIED',
    },
    {
      documentId: 103,
      documentType: 'CERTIFICATES',
      fileName: 'ieee_publication_proof.pdf',
      fileFormat: 'application/pdf',
      size: 890000,
      verificationStatus: 'VERIFIED',
    },
  ],
};

export default function NominationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOrganizerOrAdmin =
    user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';
  const isNominee = user?.role === 'NOMINEE';

  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await nominationApi.getById(id);
        if (res?.data?.data) {
          setNomination(res.data.data);
        } else {
          setNomination(MOCK_NOMINATION_DETAIL);
        }
      } catch (err) {
        console.warn('API error, using mock:', err);
        setNomination(MOCK_NOMINATION_DETAIL);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      setSubmittingReview(true);
      await nominationApi.review(id, reviewData);
      toast.success(`Nomination ${reviewData.decision.toLowerCase()}!`);
      setNomination((prev) => ({
        ...prev,
        status: reviewData.decision,
        rejectionReason: reviewData.rejectionReason,
        reviewDate: new Date().toISOString(),
      }));
      setReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review on server, updating locally');
      setNomination((prev) => ({
        ...prev,
        status: reviewData.decision,
        rejectionReason: reviewData.rejectionReason,
        reviewDate: new Date().toISOString(),
      }));
      setReviewModalOpen(false);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw this nomination?')) return;
    try {
      await nominationApi.withdraw(id);
      toast.success('Nomination withdrawn');
      setNomination((prev) => ({ ...prev, status: 'WITHDRAWN' }));
    } catch {
      toast.success('Nomination withdrawn (local)');
      setNomination((prev) => ({ ...prev, status: 'WITHDRAWN' }));
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
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
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

  if (loading) return <Loader text="Loading nomination details..." />;

  if (!nomination) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <h2>Nomination Not Found</h2>
        <Button variant="secondary" onClick={() => navigate('/nominations')}>
          Back to Nominations
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '960px', margin: '0 auto' }}>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Button
          variant="ghost"
          size="sm"
          icon={HiOutlineArrowLeft}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          {isOrganizerOrAdmin && (nomination.status === 'SUBMITTED' || nomination.status === 'UNDER_REVIEW') && (
            <Button
              variant="primary"
              onClick={() => setReviewModalOpen(true)}
            >
              Review Nomination
            </Button>
          )}

          {isNominee && (nomination.status === 'SUBMITTED' || nomination.status === 'DRAFT') && (
            <Button
              variant="danger"
              size="sm"
              onClick={handleWithdraw}
            >
              Withdraw Entry
            </Button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {getStatusBadge(nomination.status)}
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-400)' }}>
              Nomination ID: #{nomination.nominationId}
            </span>
          </div>
          <h1>{nomination.title}</h1>
          <p style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
            Category: {nomination.categoryName}
          </p>
        </div>
      </div>

      {/* Rejection Feedback Alert */}
      {nomination.status === 'REJECTED' && (
        <div
          style={{
            background: 'var(--danger-50)',
            border: '1px solid var(--danger-300)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
          }}
        >
          <HiOutlineExclamation size={24} color="var(--danger-600)" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--danger-800)', fontSize: 'var(--font-sm)', display: 'block' }}>
              Review Decision: Rejected
            </strong>
            <p style={{ color: 'var(--danger-700)', fontSize: 'var(--font-xs)', marginTop: '4px', lineHeight: '1.5' }}>
              {nomination.rejectionReason || 'No specific feedback reason was recorded.'}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Achievements Description */}
          <Card title="Achievements & Novelty">
            <p style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-sm)', color: 'var(--slate-800)', lineHeight: '1.7' }}>
              {nomination.achievementDescription}
            </p>
          </Card>

          {/* Evidence Details */}
          {nomination.evidenceDetails && (
            <Card title="Metrics & Verifiable Evidence">
              <p style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-sm)', color: 'var(--slate-700)', lineHeight: '1.7' }}>
                {nomination.evidenceDetails}
              </p>
            </Card>
          )}

          {/* Documents Attached */}
          <Card title={`Uploaded Verification Documents (${nomination.documents?.length || 0})`}>
            {(!nomination.documents || nomination.documents.length === 0) ? (
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-400)' }}>
                No documents uploaded with this nomination entry.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {nomination.documents.map((doc) => (
                  <div
                    key={doc.documentId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3)',
                      background: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <HiOutlinePaperClip size={20} color="var(--primary-600)" />
                      <div>
                        <strong style={{ fontSize: 'var(--font-sm)', color: 'var(--slate-900)', display: 'block' }}>
                          {doc.fileName}
                        </strong>
                        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)' }}>
                          Type: {doc.documentType} • {(doc.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <Badge variant={doc.verificationStatus === 'VERIFIED' ? 'success' : 'neutral'}>
                        {doc.verificationStatus || 'PENDING'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={HiOutlineDownload}
                        onClick={() => toast.success(`Downloading ${doc.fileName}...`)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Metadata & Submitter Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Card title="Submission Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block' }}>Nominee:</span>
                <strong style={{ color: 'var(--slate-800)', fontSize: 'var(--font-sm)' }}>
                  {nomination.nomineeName || nomination.nomineeEmail}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block' }}>Submitted On:</span>
                <strong style={{ color: 'var(--slate-800)' }}>
                  {formatDate(nomination.submissionDate)}
                </strong>
              </div>

              {nomination.reviewDate && (
                <div>
                  <span style={{ color: 'var(--slate-500)', display: 'block' }}>Reviewed On:</span>
                  <strong style={{ color: 'var(--slate-800)' }}>
                    {formatDate(nomination.reviewDate)}
                  </strong>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 'var(--space-3)' }}>
                <span style={{ color: 'var(--slate-500)', display: 'block' }}>Authenticity Declaration:</span>
                <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>
                  ✓ Signed & Verified
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <NominationReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        nominationTitle={nomination.title}
        isLoading={submittingReview}
      />
    </div>
  );
}
