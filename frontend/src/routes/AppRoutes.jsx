import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import OtpVerifyPage from '../features/auth/pages/OtpVerifyPage';
import DashboardRouter from '../features/dashboard/DashboardRouter';

import CategoryListPage from '../features/categories/pages/CategoryListPage';
import CategoryDetailPage from '../features/categories/pages/CategoryDetailPage';
import NominationListPage from '../features/nominations/pages/NominationListPage';
import NominationCreatePage from '../features/nominations/pages/NominationCreatePage';
import NominationDetailPage from '../features/nominations/pages/NominationDetailPage';
import NomineeProfilePage from '../features/profile/pages/NomineeProfilePage';
import VotePage from '../features/voting/pages/VotePage';
import EvaluationPage from '../features/evaluations/pages/EvaluationPage';
import ResultsPage from '../features/results/pages/ResultsPage';

/**
 * All application routes.
 * Public routes: login, register, OTP verify.
 * Protected routes: nested inside Layout with ProtectedRoute guards.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerifyPage />} />

      {/* Protected routes — wrapped in sidebar/topbar layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* Categories routes (shared across roles) */}
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/categories/:id" element={<CategoryDetailPage />} />

        {/* Nominations routes */}
        <Route path="/my-nominations" element={<NominationListPage />} />
        <Route path="/nominations" element={<NominationListPage />} />
        <Route path="/nominations/new" element={<NominationCreatePage />} />
        <Route path="/nominations/:id" element={<NominationDetailPage />} />

        {/* Nominee routes */}
        <Route path="/my-profile" element={<NomineeProfilePage />} />

        {/* Voter routes */}
        <Route path="/vote" element={<VotePage />} />

        {/* Evaluation routes */}
        <Route path="/evaluations" element={<EvaluationPage />} />
        <Route path="/my-evaluations" element={<EvaluationPage />} />

        {/* Organizer routes */}
        <Route path="/voting-overview" element={<PlaceholderPage title="Voting Overview" />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
        <Route path="/feedback" element={<PlaceholderPage title="Feedback" />} />

        {/* Admin routes */}
        <Route path="/users" element={<PlaceholderPage title="User Management" />} />
        <Route path="/audit-log" element={<PlaceholderPage title="Audit Log" />} />
        <Route path="/system" element={<PlaceholderPage title="System Settings" />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

/**
 * Temporary placeholder for pages not yet built (Phase 2+).
 */
function PlaceholderPage({ title }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-text">
          <h1>{title}</h1>
          <p>This page will be built in a later phase</p>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 300,
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          border: '2px dashed var(--slate-200)',
          color: 'var(--slate-400)',
          fontSize: 'var(--font-lg)',
          fontWeight: 500,
        }}
      >
        {title} — Coming Soon
      </div>
    </div>
  );
}
