import { useAuth } from '../../context/AuthContext';
import OrganizerDashboard from './OrganizerDashboard';
import NomineeDashboard from './NomineeDashboard';
import VoterDashboard from './VoterDashboard';
import JudgeDashboard from './JudgeDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Renders the correct dashboard based on the authenticated user's role.
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case 'AWARD_ORGANIZER':
      return <OrganizerDashboard />;
    case 'NOMINEE':
      return <NomineeDashboard />;
    case 'VOTER':
      return <VoterDashboard />;
    case 'JUDGE':
      return <JudgeDashboard />;
    case 'SYSTEM_ADMINISTRATOR':
      return <AdminDashboard />;
    default:
      return <OrganizerDashboard />;
  }
}
