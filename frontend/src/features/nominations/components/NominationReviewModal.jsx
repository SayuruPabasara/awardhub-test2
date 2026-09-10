import { useState } from 'react';
import Modal from '../../../components/Modal';
import Button from '../../../components/Button';

export default function NominationReviewModal({
  isOpen,
  onClose,
  onSubmit,
  nominationTitle,
  isLoading = false,
}) {
  const [decision, setDecision] = useState('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejecting this nomination.');
      return;
    }
    onSubmit({
      decision,
      rejectionReason: decision === 'REJECTED' ? rejectionReason : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Nomination"
      maxWidth="540px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--slate-500)', display: 'block' }}>
            Nomination:
          </span>
          <strong style={{ fontSize: 'var(--font-base)', color: 'var(--slate-900)' }}>
            {nominationTitle}
          </strong>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
            Decision
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={() => setDecision('APPROVED')}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: decision === 'APPROVED' ? '2px solid var(--success-600)' : '1px solid var(--slate-300)',
                background: decision === 'APPROVED' ? 'var(--success-50)' : '#ffffff',
                color: decision === 'APPROVED' ? 'var(--success-700)' : 'var(--slate-700)',
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              ✓ Approve Nomination
            </button>

            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: decision === 'REJECTED' ? '2px solid var(--danger-600)' : '1px solid var(--slate-300)',
                background: decision === 'REJECTED' ? 'var(--danger-50)' : '#ffffff',
                color: decision === 'REJECTED' ? 'var(--danger-700)' : 'var(--slate-700)',
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              ✗ Reject Nomination
            </button>
          </div>
        </div>

        {decision === 'REJECTED' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--danger-700)' }}>
              Rejection Reason / Feedback (Required)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State the reasons for rejection (e.g. insufficient documentation, ineligible per criteria)..."
              required
              rows={4}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                fontSize: 'var(--font-sm)',
                border: '1px solid var(--danger-300)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={decision === 'APPROVED' ? 'primary' : 'danger'}
            type="submit"
            loading={isLoading}
          >
            Confirm {decision === 'APPROVED' ? 'Approval' : 'Rejection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
