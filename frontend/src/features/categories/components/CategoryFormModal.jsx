import { useState, useEffect } from 'react';
import Modal from '../../../components/Modal';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import './CategoryFormModal.css';

const AVAILABLE_DOC_TYPES = [
  { id: 'RESUME', label: 'Resume / CV' },
  { id: 'PORTFOLIO', label: 'Project Portfolio' },
  { id: 'RECOMMENDATION_LETTER', label: 'Letter of Recommendation' },
  { id: 'IDENTITY_PROOF', label: 'Identity / NIC Proof' },
  { id: 'CERTIFICATES', label: 'Certificates & Awards' },
  { id: 'PROJECT_REPORT', label: 'Detailed Project Report' },
];

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    eligibilityCriteria: '',
    nominationDeadline: '',
    votingStartDate: '',
    votingEndDate: '',
    evaluationMethod: 'HYBRID',
    votingWeightage: 50,
    judgingWeightage: 50,
    maxVotesPerVoter: 1,
    status: 'DRAFT',
    requiredDocumentTypes: ['RESUME'],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        categoryName: initialData.categoryName || '',
        description: initialData.description || '',
        eligibilityCriteria: initialData.eligibilityCriteria || '',
        nominationDeadline: initialData.nominationDeadline ? initialData.nominationDeadline.slice(0, 16) : '',
        votingStartDate: initialData.votingStartDate ? initialData.votingStartDate.slice(0, 16) : '',
        votingEndDate: initialData.votingEndDate ? initialData.votingEndDate.slice(0, 16) : '',
        evaluationMethod: initialData.evaluationMethod || 'HYBRID',
        votingWeightage: initialData.votingWeightage ?? 50,
        judgingWeightage: initialData.judgingWeightage ?? 50,
        maxVotesPerVoter: initialData.maxVotesPerVoter ?? 1,
        status: initialData.status || 'DRAFT',
        requiredDocumentTypes: initialData.requiredDocumentTypes || ['RESUME'],
      });
    } else {
      setFormData({
        categoryName: '',
        description: '',
        eligibilityCriteria: '',
        nominationDeadline: '',
        votingStartDate: '',
        votingEndDate: '',
        evaluationMethod: 'HYBRID',
        votingWeightage: 50,
        judgingWeightage: 50,
        maxVotesPerVoter: 1,
        status: 'DRAFT',
        requiredDocumentTypes: ['RESUME'],
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocToggle = (docId) => {
    setFormData((prev) => {
      const exists = prev.requiredDocumentTypes.includes(docId);
      const updated = exists
        ? prev.requiredDocumentTypes.filter((d) => d !== docId)
        : [...prev.requiredDocumentTypes, docId];
      return { ...prev, requiredDocumentTypes: updated };
    });
  };

  const handleSliderChange = (e) => {
    const voting = Number(e.target.value);
    const judging = 100 - voting;
    setFormData((prev) => ({
      ...prev,
      votingWeightage: voting,
      judgingWeightage: judging,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      maxVotesPerVoter: Number(formData.maxVotesPerVoter),
      votingWeightage: formData.evaluationMethod === 'HYBRID' ? Number(formData.votingWeightage) : (formData.evaluationMethod === 'VOTING_ONLY' ? 100 : 0),
      judgingWeightage: formData.evaluationMethod === 'HYBRID' ? Number(formData.judgingWeightage) : (formData.evaluationMethod === 'JUDGING_ONLY' ? 100 : 0),
      nominationDeadline: formData.nominationDeadline ? `${formData.nominationDeadline}:00` : null,
      votingStartDate: formData.votingStartDate ? `${formData.votingStartDate}:00` : null,
      votingEndDate: formData.votingEndDate ? `${formData.votingEndDate}:00` : null,
    };
    onSubmit(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Award Category' : 'Create New Award Category'}
      maxWidth="700px"
    >
      <form onSubmit={handleSubmit} className="category-modal-form">
        <Input
          label="Category Name"
          name="categoryName"
          value={formData.categoryName}
          onChange={handleChange}
          placeholder="e.g. Research Excellence Award"
          required
        />

        <div className="category-form-field">
          <label className="category-form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Brief overview of what this award honors..."
            className="category-form-textarea"
            rows={3}
          />
        </div>

        <div className="category-form-field">
          <label className="category-form-label">Eligibility Criteria</label>
          <textarea
            name="eligibilityCriteria"
            value={formData.eligibilityCriteria}
            onChange={handleChange}
            placeholder="Who is eligible? Requirements, age, organization..."
            className="category-form-textarea"
            rows={3}
          />
        </div>

        <div className="category-form-row">
          <Input
            label="Nomination Deadline"
            type="datetime-local"
            name="nominationDeadline"
            value={formData.nominationDeadline}
            onChange={handleChange}
          />
          <div className="category-form-field">
            <label className="category-form-label">Initial Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="category-form-select"
            >
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="NOMINATIONS_OPEN">Nominations Open</option>
              <option value="NOMINATIONS_CLOSED">Nominations Closed</option>
              <option value="VOTING_OPEN">Voting Open</option>
              <option value="VOTING_CLOSED">Voting Closed</option>
              <option value="UNDER_EVALUATION">Under Evaluation</option>
              <option value="RESULTS_READY">Results Ready</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        <div className="category-form-row">
          <Input
            label="Voting Start Date"
            type="datetime-local"
            name="votingStartDate"
            value={formData.votingStartDate}
            onChange={handleChange}
          />
          <Input
            label="Voting End Date"
            type="datetime-local"
            name="votingEndDate"
            value={formData.votingEndDate}
            onChange={handleChange}
          />
        </div>

        <div className="category-form-row">
          <div className="category-form-field">
            <label className="category-form-label">Evaluation Method</label>
            <select
              name="evaluationMethod"
              value={formData.evaluationMethod}
              onChange={handleChange}
              className="category-form-select"
            >
              <option value="HYBRID">Hybrid (Voting + Judging)</option>
              <option value="VOTING_ONLY">Public Voting Only</option>
              <option value="JUDGING_ONLY">Judge Evaluation Only</option>
            </select>
          </div>

          <Input
            label="Max Votes per Voter"
            type="number"
            min="1"
            max="10"
            name="maxVotesPerVoter"
            value={formData.maxVotesPerVoter}
            onChange={handleChange}
          />
        </div>

        {formData.evaluationMethod === 'HYBRID' && (
          <div className="category-slider-box">
            <div className="category-slider-values">
              <span>Public Voting: {formData.votingWeightage}%</span>
              <span>Judge Scoring: {formData.judgingWeightage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={formData.votingWeightage}
              onChange={handleSliderChange}
            />
          </div>
        )}

        <div className="category-form-field">
          <label className="category-form-label">Required Documents for Nominees</label>
          <div className="category-doc-checkboxes">
            {AVAILABLE_DOC_TYPES.map((doc) => (
              <label key={doc.id} className="category-doc-check-label">
                <input
                  type="checkbox"
                  checked={formData.requiredDocumentTypes.includes(doc.id)}
                  onChange={() => handleDocToggle(doc.id)}
                />
                <span>{doc.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="category-modal-actions">
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={isLoading}>
            {initialData ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
