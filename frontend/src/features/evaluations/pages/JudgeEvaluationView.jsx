import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineDocumentText,
  HiOutlineRefresh,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import { evaluationApi } from '../api';

const emptyScores = (rubric = []) =>
  rubric.reduce((acc, criterion) => {
    acc[criterion.key] = 0;
    return acc;
  }, {});

export default function JudgeEvaluationView() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await evaluationApi.getAssignments();
      const list = res?.data?.data || [];
      setAssignments(list);

      // Pre-populate scores and comments from existing assignments
      const initialScores = {};
      const initialComments = {};
      list.forEach((item) => {
        initialScores[item.evaluationId] =
          item.criterionScores && Object.keys(item.criterionScores).length > 0
            ? item.criterionScores
            : emptyScores(item.rubric || []);
        initialComments[item.evaluationId] = item.comments || '';
      });
      setScores(initialScores);
      setComments(initialComments);

      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0].evaluationId);
      }
    } catch (err) {
      console.error('Failed to load judge assignments:', err);
      toast.error('Failed to load your evaluation assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const selectedAssignment = useMemo(() => {
    if (!assignments || assignments.length === 0) return null;
    return assignments.find((item) => item.evaluationId === selectedId) || assignments[0];
  }, [assignments, selectedId]);

  const handleSelectAssignment = (evaluationId) => {
    setSelectedId(evaluationId);
    const assignment = assignments.find((item) => item.evaluationId === evaluationId);
    if (assignment && !scores[evaluationId]) {
      setScores((prev) => ({
        ...prev,
        [evaluationId]:
          assignment.criterionScores && Object.keys(assignment.criterionScores).length > 0
            ? assignment.criterionScores
            : emptyScores(assignment.rubric || []),
      }));
    }
  };

  const handleScoreChange = (criterionKey, value) => {
    if (!selectedAssignment || selectedAssignment.status === 'COMPLETED') return;
    const numValue = Math.min(100, Math.max(0, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [selectedAssignment.evaluationId]: {
        ...(prev[selectedAssignment.evaluationId] || {}),
        [criterionKey]: numValue,
      },
    }));
  };

  const handleCommentChange = (value) => {
    if (!selectedAssignment || selectedAssignment.status === 'COMPLETED') return;
    setComments((prev) => ({
      ...prev,
      [selectedAssignment.evaluationId]: value,
    }));
  };

  const totalScore = useMemo(() => {
    if (!selectedAssignment) return 0;
    const currentScores = scores[selectedAssignment.evaluationId] || {};
    const rubric = selectedAssignment.rubric || [];
    if (rubric.length === 0) return 0;

    let totalWeighted = 0;
    let totalWeight = 0;

    rubric.forEach((criterion) => {
      const val = currentScores[criterion.key] ?? 0;
      const wt = criterion.weight || 0;
      totalWeighted += val * (wt / 100);
      totalWeight += wt / 100;
    });

    if (totalWeight > 0) {
      return totalWeighted / totalWeight;
    }
    return 0;
  }, [scores, selectedAssignment]);

  const handleSubmit = async () => {
    if (!selectedAssignment || selectedAssignment.status === 'COMPLETED') return;

    try {
      setSubmitting(true);
      const evalId = selectedAssignment.evaluationId;
      const currentScores = scores[evalId] || {};
      const currentComment = comments[evalId] || '';

      const payload = {
        nominationId: selectedAssignment.nominationId,
        scores: currentScores,
        comments: currentComment,
      };

      const res = await evaluationApi.submit(evalId, payload);
      const updatedData = res?.data?.data;

      toast.success(
        `Evaluation submitted for ${selectedAssignment.nomineeName || selectedAssignment.nominationTitle}`
      );

      // Update local state
      setAssignments((prev) =>
        prev.map((item) =>
          item.evaluationId === evalId
            ? {
                ...item,
                status: 'COMPLETED',
                totalScore: updatedData?.totalScore ?? totalScore,
                comments: currentComment,
                criterionScores: currentScores,
              }
            : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not submit the evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'TBD';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader text="Loading your assigned evaluations..." />;
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={HiOutlineClipboardCheck}
        title="No Evaluations Assigned"
        message="You currently do not have any nominations assigned to you for evaluation."
        action={
          <Button variant="secondary" icon={HiOutlineRefresh} onClick={fetchAssignments}>
            Refresh
          </Button>
        }
      />
    );
  }

  const pendingCount = assignments.filter((item) => item.status === 'PENDING').length;
  const completedCount = assignments.filter((item) => item.status === 'COMPLETED').length;

  return (
    <div className="evaluation-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Judging Workspace</h1>
          <p>Review nominations assigned to you, score each against the rubric, and submit your evaluations.</p>
        </div>
        <Button variant="secondary" size="sm" icon={HiOutlineRefresh} onClick={fetchAssignments}>
          Refresh
        </Button>
      </div>

      <div className="evaluation-summary-grid">
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineClipboardCheck size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{assignments.length}</div>
            <div className="evaluation-summary-label">Assigned</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineClock size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{pendingCount}</div>
            <div className="evaluation-summary-label">Pending</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineCheckCircle size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{completedCount}</div>
            <div className="evaluation-summary-label">Submitted</div>
          </div>
        </div>
      </div>

      <div className="evaluation-layout">
        <aside className="evaluation-list-panel">
          <div className="panel-header">
            <h2>Your Assignments</h2>
            <span className="count-badge">{assignments.length}</span>
          </div>

          <div className="assignment-scroll-list">
            {assignments.map((assignment) => (
              <button
                key={assignment.evaluationId}
                type="button"
                className={`assignment-item ${
                  selectedAssignment?.evaluationId === assignment.evaluationId ? 'selected' : ''
                }`}
                onClick={() => handleSelectAssignment(assignment.evaluationId)}
              >
                <div className="assignment-main">
                  <strong>{assignment.nomineeName || 'Nominee'}</strong>
                  <span className="assignment-category">{assignment.categoryName}</span>
                  <small className="assignment-title">{assignment.nominationTitle}</small>
                </div>
                <div className="assignment-meta-row">
                  <Badge variant={assignment.status === 'COMPLETED' ? 'success' : 'warning'}>
                    {assignment.status}
                  </Badge>
                  <small>Due {formatDate(assignment.dueDate)}</small>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selectedAssignment && (
          <section className="evaluation-form-panel">
            <div className="panel-header">
              <div>
                <h2>{selectedAssignment.categoryName}</h2>
                <p>
                  <strong>{selectedAssignment.nomineeName}</strong>
                  {selectedAssignment.nomineeEmail && ` · ${selectedAssignment.nomineeEmail}`}
                </p>
              </div>
              <Badge variant={selectedAssignment.status === 'COMPLETED' ? 'success' : 'primary'}>
                {selectedAssignment.status}
              </Badge>
            </div>

            <div className="nomination-summary-box">
              <h3>
                <HiOutlineDocumentText size={18} style={{ marginRight: 6 }} />
                Nomination: {selectedAssignment.nominationTitle}
              </h3>
              <p>
                {selectedAssignment.nominationSummary ||
                  'No description provided for this nomination.'}
              </p>
            </div>

            <div className="rubric-header-title">
              <h3>Scoring Rubric</h3>
              <span className="rubric-hint">
                {selectedAssignment.status === 'COMPLETED'
                  ? 'Submitted Scores (Read-only)'
                  : 'Score each criterion from 0 to 100 based on the evaluation guidelines'}
              </span>
            </div>

            <div className="rubric-form">
              {(selectedAssignment.rubric || []).map((criterion) => {
                const value =
                  scores[selectedAssignment.evaluationId]?.[criterion.key] ?? 0;
                const weightedContrib = ((value * (criterion.weight || 0)) / 100).toFixed(1);

                return (
                  <div key={criterion.key} className="criterion-row">
                    <div className="criterion-header">
                      <label>{criterion.label}</label>
                      <span className="criterion-score-badge">{value} / 100</span>
                    </div>
                    <div className="criterion-slider-wrap">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={value}
                        disabled={selectedAssignment.status === 'COMPLETED'}
                        onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                      />
                    </div>
                    <div className="criterion-footer">
                      <small>Weight: {criterion.weight}%</small>
                      <small>Weighted contribution: {weightedContrib}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="judge-comments-section">
              <label htmlFor="judge-comments">
                <strong>Judge Comments / Feedback</strong>
              </label>
              <textarea
                id="judge-comments"
                rows={4}
                className="judge-comments-textarea"
                placeholder={
                  selectedAssignment.status === 'COMPLETED'
                    ? 'No comments submitted'
                    : 'Provide constructive feedback, strengths, and areas for improvement...'
                }
                value={comments[selectedAssignment.evaluationId] || ''}
                disabled={selectedAssignment.status === 'COMPLETED'}
                onChange={(e) => handleCommentChange(e.target.value)}
              />
            </div>

            <div className="evaluation-footer-bar">
              <div className="evaluation-total-card">
                <span>Total Weighted Score</span>
                <strong>
                  {selectedAssignment.status === 'COMPLETED' && selectedAssignment.totalScore != null
                    ? selectedAssignment.totalScore.toFixed(1)
                    : totalScore.toFixed(1)}
                  /100
                </strong>
              </div>
              <Button
                variant="primary"
                icon={HiOutlineStar}
                onClick={handleSubmit}
                loading={submitting}
                disabled={selectedAssignment.status === 'COMPLETED' || submitting}
              >
                {selectedAssignment.status === 'COMPLETED' ? 'Submitted' : 'Submit Evaluation'}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
