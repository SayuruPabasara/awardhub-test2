import { useMemo, useState } from 'react';
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineStar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import './EvaluationPage.css';

const DEFAULT_ASSIGNMENTS = [
  {
    evaluationId: 1,
    nominationId: 101,
    categoryName: 'Outstanding Research Innovation',
    nomineeName: 'Dr. Sarah Chen',
    nomineeEmail: 'sarah.chen@university.edu',
    dueDate: '2026-09-15T23:59:00',
    status: 'PENDING',
    summary:
      'AI-based autonomous navigation system for search and rescue operations in hazardous environments.',
    rubric: [
      { key: 'innovation', label: 'Innovation', weight: 30 },
      { key: 'impact', label: 'Impact & Relevance', weight: 25 },
      { key: 'feasibility', label: 'Feasibility', weight: 20 },
      { key: 'presentation', label: 'Presentation & Clarity', weight: 15 },
      { key: 'ethics', label: 'Ethical & Societal Considerations', weight: 10 },
    ],
  },
  {
    evaluationId: 2,
    nominationId: 102,
    categoryName: 'Community Impact & Leadership',
    nomineeName: 'James Rodriguez',
    nomineeEmail: 'j.rodriguez@ecoaid.org',
    dueDate: '2026-09-18T23:59:00',
    status: 'PENDING',
    summary:
      'Community-led clean water access initiative with measurable improvements to public health outcomes.',
    rubric: [
      { key: 'innovation', label: 'Innovation', weight: 20 },
      { key: 'impact', label: 'Impact & Relevance', weight: 30 },
      { key: 'feasibility', label: 'Feasibility', weight: 20 },
      { key: 'presentation', label: 'Presentation & Clarity', weight: 15 },
      { key: 'ethics', label: 'Ethical & Societal Considerations', weight: 15 },
    ],
  },
  {
    evaluationId: 3,
    nominationId: 103,
    categoryName: 'Technology Innovation of the Year',
    nomineeName: 'Aisha Patel',
    nomineeEmail: 'aisha.p@techlabs.io',
    dueDate: '2026-09-11T23:59:00',
    status: 'COMPLETED',
    summary:
      'Adaptive learning interface for neurodivergent students using personalized, human-centered design.',
    rubric: [
      { key: 'innovation', label: 'Innovation', weight: 25 },
      { key: 'impact', label: 'Impact & Relevance', weight: 25 },
      { key: 'feasibility', label: 'Feasibility', weight: 20 },
      { key: 'presentation', label: 'Presentation & Clarity', weight: 15 },
      { key: 'ethics', label: 'Ethical & Societal Considerations', weight: 15 },
    ],
  },
];

const emptyScores = (rubric) =>
  rubric.reduce((acc, criterion) => {
    acc[criterion.key] = 0;
    return acc;
  }, {});

export default function EvaluationPage() {
  const [assignments, setAssignments] = useState(DEFAULT_ASSIGNMENTS);
  const [selectedId, setSelectedId] = useState(DEFAULT_ASSIGNMENTS[0]?.evaluationId ?? null);
  const [scores, setScores] = useState(() => ({
    [DEFAULT_ASSIGNMENTS[0]?.evaluationId]: emptyScores(DEFAULT_ASSIGNMENTS[0]?.rubric || []),
  }));

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.evaluationId === selectedId) ?? assignments[0],
    [assignments, selectedId]
  );

  const handleSelectAssignment = (evaluationId) => {
    setSelectedId(evaluationId);
    const assignment = assignments.find((item) => item.evaluationId === evaluationId);
    setScores((prev) => ({
      ...prev,
      [evaluationId]: prev[evaluationId] ?? emptyScores(assignment?.rubric || []),
    }));
  };

  const handleScoreChange = (criterionKey, value) => {
    if (!selectedAssignment) return;
    setScores((prev) => ({
      ...prev,
      [selectedAssignment.evaluationId]: {
        ...(prev[selectedAssignment.evaluationId] || {}),
        [criterionKey]: Number(value),
      },
    }));
  };

  const totalScore = useMemo(() => {
    if (!selectedAssignment) return 0;
    const currentScores = scores[selectedAssignment.evaluationId] || {};
    return selectedAssignment.rubric.reduce((sum, criterion) => {
      const weighted = (currentScores[criterion.key] || 0) * (criterion.weight / 100);
      return sum + weighted;
    }, 0);
  }, [scores, selectedAssignment]);

  const handleSubmit = async () => {
    if (!selectedAssignment) return;

    try {
      const payload = {
        nominationId: selectedAssignment.nominationId,
        scores: scores[selectedAssignment.evaluationId] || {},
        totalScore,
      };

      // Demo only: local state update to mimic submission
      setAssignments((prev) =>
        prev.map((item) =>
          item.evaluationId === selectedAssignment.evaluationId
            ? { ...item, status: 'COMPLETED' }
            : item
        )
      );

      toast.success(`Evaluation submitted for ${selectedAssignment.nomineeName}`);
    } catch (err) {
      console.error(err);
      toast.error('Could not submit the evaluation');
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

  if (!selectedAssignment) {
    return <div className="evaluation-empty">No evaluation assignments available.</div>;
  }

  return (
    <div className="evaluation-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Judging Workspace</h1>
          <p>Review submissions, score nominees against the rubric, and submit your evaluations.</p>
        </div>
      </div>

      <div className="evaluation-summary-grid">
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon"><HiOutlineClipboardCheck size={22} /></div>
          <div>
            <div className="evaluation-summary-value">{assignments.length}</div>
            <div className="evaluation-summary-label">Assigned</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon"><HiOutlineClock size={22} /></div>
          <div>
            <div className="evaluation-summary-value">
              {assignments.filter((item) => item.status === 'PENDING').length}
            </div>
            <div className="evaluation-summary-label">Pending</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon"><HiOutlineCheckCircle size={22} /></div>
          <div>
            <div className="evaluation-summary-value">
              {assignments.filter((item) => item.status === 'COMPLETED').length}
            </div>
            <div className="evaluation-summary-label">Submitted</div>
          </div>
        </div>
      </div>

      <div className="evaluation-layout">
        <aside className="evaluation-list-panel">
          <div className="panel-header">
            <h2>Assignments</h2>
          </div>

          {assignments.map((assignment) => (
            <button
              key={assignment.evaluationId}
              type="button"
              className={`assignment-item ${selectedId === assignment.evaluationId ? 'selected' : ''}`}
              onClick={() => handleSelectAssignment(assignment.evaluationId)}
            >
              <div className="assignment-main">
                <strong>{assignment.nomineeName}</strong>
                <span>{assignment.categoryName}</span>
              </div>
              <div className="assignment-meta-row">
                <Badge variant={assignment.status === 'COMPLETED' ? 'success' : 'warning'}>
                  {assignment.status}
                </Badge>
                <small>Due {formatDate(assignment.dueDate)}</small>
              </div>
            </button>
          ))}
        </aside>

        <section className="evaluation-form-panel">
          <div className="panel-header">
            <div>
              <h2>{selectedAssignment.categoryName}</h2>
              <p>{selectedAssignment.nomineeName} · {selectedAssignment.nomineeEmail}</p>
            </div>
            <Badge variant={selectedAssignment.status === 'COMPLETED' ? 'success' : 'primary'}>
              {selectedAssignment.status}
            </Badge>
          </div>

          <div className="nomination-summary-box">
            <h3>Nomination Summary</h3>
            <p>{selectedAssignment.summary}</p>
          </div>

          <div className="rubric-form">
            {selectedAssignment.rubric.map((criterion) => {
              const value = scores[selectedAssignment.evaluationId]?.[criterion.key] ?? 0;
              return (
                <div key={criterion.key} className="criterion-row">
                  <div className="criterion-header">
                    <label>{criterion.label}</label>
                    <span>{value}/100</span>
                  </div>
                  <div className="criterion-slider-wrap">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={value}
                      onChange={(e) => handleScoreChange(criterion.key, e.target.value)}
                    />
                  </div>
                  <div className="criterion-footer">
                    <small>Weight: {criterion.weight}%</small>
                    <small>Weighted contribution: {(value * criterion.weight / 100).toFixed(1)}</small>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="evaluation-footer-bar">
            <div className="evaluation-total-card">
              <span>Total Score</span>
              <strong>{totalScore.toFixed(1)}/100</strong>
            </div>
            <Button
              variant="primary"
              icon={HiOutlineStar}
              onClick={handleSubmit}
              disabled={selectedAssignment.status === 'COMPLETED'}
            >
              {selectedAssignment.status === 'COMPLETED' ? 'Submitted' : 'Submit Evaluation'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
