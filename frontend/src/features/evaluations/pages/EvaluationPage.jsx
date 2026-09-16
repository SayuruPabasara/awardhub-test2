import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import JudgeEvaluationView from './JudgeEvaluationView';
import OrganizerEvaluationView from './OrganizerEvaluationView';
import './EvaluationPage.css';

/**
 * EvaluationPage entry component.
 * Renders JudgeEvaluationView for Judges (or at /my-evaluations),
 * and OrganizerEvaluationView for Organizers and System Administrators (or at /evaluations).
 */
export default function EvaluationPage() {
  const { user } = useAuth();
  const location = useLocation();

  const isJudge = user?.role === 'JUDGE' || location.pathname === '/my-evaluations';

  if (isJudge) {
    return <JudgeEvaluationView />;
  }

  return <OrganizerEvaluationView />;
}
