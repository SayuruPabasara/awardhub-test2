import { useEffect, useMemo, useState } from 'react';
import {
  HiOutlineClipboardCheck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineChartBar,
  HiOutlineUserAdd,
  HiOutlineRefresh,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiChevronRight,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import Badge from '../../../components/Badge';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import { evaluationApi } from '../api';
import { categoryApi } from '../../categories/api';
import { nominationApi } from '../../nominations/api';
import { userApi } from '../../users/api';

export default function OrganizerEvaluationView() {
  const [evaluations, setEvaluations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedNominationId, setSelectedNominationId] = useState(null);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignCategory, setAssignCategory] = useState('');
  const [assignNominations, setAssignNominations] = useState([]);
  const [selectedAssignNomination, setSelectedAssignNomination] = useState('');
  const [availableJudges, setAvailableJudges] = useState([]);
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [loadingNominees, setLoadingNominees] = useState(false);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const [evalRes, catRes] = await Promise.all([
        evaluationApi.getAll(params),
        categories.length === 0 ? categoryApi.getAll() : Promise.resolve({ data: { data: categories } }),
      ]);

      const list = evalRes?.data?.data || [];
      setEvaluations(list);

      if (categories.length === 0) {
        setCategories(catRes?.data?.data || []);
      }

      if (list.length > 0 && !selectedNominationId) {
        setSelectedNominationId(list[0].nominationId);
      }
    } catch (err) {
      console.error('Failed to load evaluations:', err);
      toast.error('Failed to load evaluations data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [selectedCategoryId, statusFilter]);

  // Group evaluations by nomination
  const groupedNominations = useMemo(() => {
    const groups = {};
    evaluations.forEach((item) => {
      const nomId = item.nominationId;
      if (!groups[nomId]) {
        groups[nomId] = {
          nominationId: nomId,
          nominationTitle: item.nominationTitle || 'Untitled Nomination',
          nominationSummary: item.nominationSummary || '',
          nomineeName: item.nomineeName || 'Nominee',
          nomineeEmail: item.nomineeEmail || '',
          categoryName: item.categoryName || 'Category',
          categoryId: item.categoryId,
          rubric: item.rubric || [],
          evaluations: [],
        };
      }
      groups[nomId].evaluations.push(item);
    });

    return Object.values(groups);
  }, [evaluations]);

  const selectedGroup = useMemo(() => {
    if (groupedNominations.length === 0) return null;
    return (
      groupedNominations.find((g) => g.nominationId === selectedNominationId) ||
      groupedNominations[0]
    );
  }, [groupedNominations, selectedNominationId]);

  // Summary statistics
  const stats = useMemo(() => {
    const total = evaluations.length;
    const pending = evaluations.filter((e) => e.status === 'PENDING').length;
    const completed = evaluations.filter((e) => e.status === 'COMPLETED');
    const avgScore =
      completed.length > 0
        ? (
            completed.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) /
            completed.length
          ).toFixed(1)
        : '0.0';

    return { total, pending, completed: completed.length, avgScore };
  }, [evaluations]);

  // Open Assign Modal and fetch judges
  const handleOpenAssignModal = async () => {
    setIsAssignModalOpen(true);
    setAssignCategory(categories[0]?.categoryId ? String(categories[0].categoryId) : '');
    setSelectedJudgeIds([]);
    try {
      const judgesRes = await userApi.getByRole('JUDGE');
      setAvailableJudges(judgesRes?.data?.data || []);
    } catch (err) {
      console.error('Failed to load judges:', err);
      toast.error('Failed to load active judges');
    }
  };

  // When assignCategory changes in modal, load approved nominations
  useEffect(() => {
    if (!isAssignModalOpen || !assignCategory) return;
    const loadApproved = async () => {
      try {
        setLoadingNominees(true);
        const res = await nominationApi.getApprovedByCategory(assignCategory);
        const noms = res?.data?.data || [];
        setAssignNominations(noms);
        setSelectedAssignNomination(noms.length > 0 ? String(noms[0].nominationId) : '');
      } catch (err) {
        console.error('Failed to load approved nominations:', err);
      } finally {
        setLoadingNominees(false);
      }
    };
    loadApproved();
  }, [assignCategory, isAssignModalOpen]);

  const handleToggleJudge = (judgeId) => {
    setSelectedJudgeIds((prev) =>
      prev.includes(judgeId) ? prev.filter((id) => id !== judgeId) : [...prev, judgeId]
    );
  };

  const handleConfirmAssignment = async () => {
    if (!selectedAssignNomination) {
      toast.error('Please select an approved nomination');
      return;
    }
    if (selectedJudgeIds.length === 0) {
      toast.error('Please select at least one judge');
      return;
    }

    try {
      setAssigning(true);
      await evaluationApi.assignJudges({
        nominationId: Number(selectedAssignNomination),
        judgeIds: selectedJudgeIds,
      });
      toast.success('Judges assigned successfully');
      setIsAssignModalOpen(false);
      fetchEvaluations();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to assign judges');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (evaluationId, judgeEmail) => {
    if (!window.confirm(`Are you sure you want to unassign ${judgeEmail}?`)) return;

    try {
      await evaluationApi.unassign(evaluationId);
      toast.success('Judge unassigned');
      fetchEvaluations();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Could not unassign judge');
    }
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="evaluation-page organizer-view">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Evaluation Oversight & Judge Assignments</h1>
          <p>
            Monitor scoring progress across all categories, review judge evaluations, and assign
            evaluators.
          </p>
        </div>
        <div className="header-actions-row">
          <Button variant="secondary" size="sm" icon={HiOutlineRefresh} onClick={fetchEvaluations}>
            Refresh
          </Button>
          <Button variant="primary" size="sm" icon={HiOutlineUserAdd} onClick={handleOpenAssignModal}>
            Assign Judges
          </Button>
        </div>
      </div>

      <div className="evaluation-summary-grid">
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineClipboardCheck size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{stats.total}</div>
            <div className="evaluation-summary-label">Total Assigned</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineClock size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{stats.pending}</div>
            <div className="evaluation-summary-label">Pending Reviews</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineCheckCircle size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{stats.completed}</div>
            <div className="evaluation-summary-label">Completed Reviews</div>
          </div>
        </div>
        <div className="evaluation-summary-card">
          <div className="evaluation-summary-icon">
            <HiOutlineChartBar size={22} />
          </div>
          <div>
            <div className="evaluation-summary-value">{stats.avgScore}</div>
            <div className="evaluation-summary-label">Average Score / 100</div>
          </div>
        </div>
      </div>

      <div className="evaluation-filter-bar">
        <div className="filter-item">
          <HiOutlineFilter size={18} className="filter-icon" />
          <select
            className="filter-select"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
          >
            <option value="">All Award Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="status-filter-pills">
          {['ALL', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              type="button"
              className={`pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader text="Loading evaluation records..." />
      ) : groupedNominations.length === 0 ? (
        <EmptyState
          icon={HiOutlineClipboardCheck}
          title="No Evaluations Found"
          message="No evaluation records match your current category or status filter."
          action={
            <Button variant="primary" icon={HiOutlineUserAdd} onClick={handleOpenAssignModal}>
              Assign Judges to Nominations
            </Button>
          }
        />
      ) : (
        <div className="evaluation-layout">
          {/* Nominations master list */}
          <aside className="evaluation-list-panel">
            <div className="panel-header">
              <h2>Nominations ({groupedNominations.length})</h2>
            </div>

            <div className="assignment-scroll-list">
              {groupedNominations.map((group) => {
                const totalJudgeCount = group.evaluations.length;
                const completedJudgeCount = group.evaluations.filter(
                  (e) => e.status === 'COMPLETED'
                ).length;
                const isAllDone = totalJudgeCount > 0 && completedJudgeCount === totalJudgeCount;

                return (
                  <button
                    key={group.nominationId}
                    type="button"
                    className={`assignment-item ${
                      selectedGroup?.nominationId === group.nominationId ? 'selected' : ''
                    }`}
                    onClick={() => setSelectedNominationId(group.nominationId)}
                  >
                    <div className="assignment-main">
                      <strong>{group.nominationTitle}</strong>
                      <span className="assignment-category">{group.categoryName}</span>
                      <small className="assignment-title">Nominee: {group.nomineeName}</small>
                    </div>
                    <div className="assignment-meta-row">
                      <Badge variant={isAllDone ? 'success' : completedJudgeCount > 0 ? 'primary' : 'warning'}>
                        {completedJudgeCount} / {totalJudgeCount} Evaluated
                      </Badge>
                      <HiChevronRight size={16} />
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Detailed judge evaluations for selected nomination */}
          {selectedGroup && (
            <section className="evaluation-form-panel organizer-detail-panel">
              <div className="panel-header">
                <div>
                  <h2>{selectedGroup.nominationTitle}</h2>
                  <p>
                    Category: <strong>{selectedGroup.categoryName}</strong> · Nominee:{' '}
                    <strong>{selectedGroup.nomineeName}</strong> ({selectedGroup.nomineeEmail})
                  </p>
                </div>
              </div>

              <div className="nomination-summary-box">
                <h3>
                  <HiOutlineDocumentText size={18} style={{ marginRight: 6 }} />
                  Nomination Description
                </h3>
                <p>{selectedGroup.nominationSummary || 'No description provided.'}</p>
              </div>

              <div className="organizer-judges-header">
                <h3>Assigned Judges & Rubric Breakdown ({selectedGroup.evaluations.length})</h3>
              </div>

              <div className="organizer-evaluations-list">
                {selectedGroup.evaluations.map((evalItem) => {
                  const isDone = evalItem.status === 'COMPLETED';

                  return (
                    <div key={evalItem.evaluationId} className="judge-eval-card">
                      <div className="judge-card-header">
                        <div>
                          <div className="judge-card-title">
                            <strong>{evalItem.judgeName || evalItem.judgeEmail}</strong>
                            <small>({evalItem.judgeEmail})</small>
                          </div>
                          <span className="judge-card-date">
                            {isDone
                              ? `Submitted: ${formatDate(evalItem.submissionDate)}`
                              : `Assigned on: ${formatDate(evalItem.submissionDate)}`}
                          </span>
                        </div>
                        <div className="judge-card-actions">
                          <Badge variant={isDone ? 'success' : 'warning'}>
                            {evalItem.status}
                          </Badge>
                          {isDone ? (
                            <div className="judge-score-badge">
                              Score: <strong>{evalItem.totalScore?.toFixed(1)} / 100</strong>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="unassign-btn"
                              title="Unassign judge"
                              onClick={() => handleUnassign(evalItem.evaluationId, evalItem.judgeEmail)}
                            >
                              <HiOutlineTrash size={16} />
                              Unassign
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rubric scores breakdown if completed */}
                      {isDone && (
                        <div className="organizer-rubric-breakdown">
                          <span className="breakdown-title">Criterion Scores:</span>
                          <div className="breakdown-chips-grid">
                            {(evalItem.rubric || selectedGroup.rubric || []).map((crit) => {
                              const score = evalItem.criterionScores?.[crit.key] ?? 'N/A';
                              return (
                                <div key={crit.key} className="breakdown-chip">
                                  <span className="chip-label">{crit.label}</span>
                                  <span className="chip-weight">({crit.weight}%)</span>
                                  <strong className="chip-score">{score} / 100</strong>
                                </div>
                              );
                            })}
                          </div>
                          {evalItem.comments && (
                            <div className="judge-comment-box">
                              <strong>Feedback:</strong> {evalItem.comments}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Assign Judges Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Judges to Approved Nomination"
        size="lg"
        footer={
          <div className="modal-footer-actions">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={HiOutlineUserAdd}
              loading={assigning}
              disabled={assigning || !selectedAssignNomination || selectedJudgeIds.length === 0}
              onClick={handleConfirmAssignment}
            >
              Assign Judges ({selectedJudgeIds.length})
            </Button>
          </div>
        }
      >
        <div className="assign-modal-form">
          <div className="form-group">
            <label><strong>Award Category</strong></label>
            <select
              className="form-select"
              value={assignCategory}
              onChange={(e) => setAssignCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label><strong>Select Approved Nomination</strong></label>
            {loadingNominees ? (
              <p className="loading-hint">Loading approved nominations...</p>
            ) : assignNominations.length === 0 ? (
              <p className="empty-hint">No approved nominations available in this category.</p>
            ) : (
              <select
                className="form-select"
                value={selectedAssignNomination}
                onChange={(e) => setSelectedAssignNomination(e.target.value)}
              >
                {assignNominations.map((nom) => (
                  <option key={nom.nominationId} value={nom.nominationId}>
                    {nom.title} — Nominee: {nom.nomineeName || nom.nomineeEmail}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="form-group">
            <label>
              <strong>Select Judges ({selectedJudgeIds.length} selected)</strong>
            </label>
            {availableJudges.length === 0 ? (
              <p className="empty-hint">No active judges found in the system.</p>
            ) : (
              <div className="judges-checkbox-list">
                {availableJudges.map((judge) => {
                  const isSelected = selectedJudgeIds.includes(judge.userID);
                  return (
                    <label key={judge.userID} className={`judge-checkbox-item ${isSelected ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleJudge(judge.userID)}
                      />
                      <div className="judge-info">
                        <strong>{judge.email}</strong>
                        {judge.contactNumber && <small>Contact: {judge.contactNumber}</small>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
