import { useState, useEffect, useCallback } from 'react';
import { HiOutlineChartBar, HiOutlineDocumentText, HiOutlineThumbUp, HiOutlineUserGroup } from 'react-icons/hi';
import { reportsApi } from '../api';
import Card from '../../../components/Card';
import StatCard from '../../../components/StatCard';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import './ReportsPage.css';

export default function ReportsPage() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await reportsApi.getAllCategoryStatistics();
      setStats(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = stats.reduce(
    (acc, s) => ({
      nominations: acc.nominations + (s.totalNominations || 0),
      approved: acc.approved + (s.approvedNominations || 0),
      votes: acc.votes + (s.totalVotes || 0),
      evaluators: acc.evaluators + (s.totalEvaluators || 0),
    }),
    { nominations: 0, approved: 0, votes: 0, evaluators: 0 }
  );

  if (loading) return <Loader text="Loading reports..." />;

  if (error) {
    return (
      <EmptyState
        icon={HiOutlineChartBar}
        title="Could not load reports"
        message={error}
        action={<button className="btn btn-primary" onClick={loadData}>Retry</button>}
      />
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Reports &amp; Analytics</h1>
          <p>Category-level statistics for nominations, votes, and judge evaluations.</p>
        </div>
      </div>

      <div className="reports-stats-grid">
        <StatCard icon={HiOutlineDocumentText} label="Total Nominations" value={totals.nominations} color="primary" />
        <StatCard icon={HiOutlineChartBar} label="Approved Nominations" value={totals.approved} color="success" />
        <StatCard icon={HiOutlineThumbUp} label="Total Votes Cast" value={totals.votes} color="accent" />
        <StatCard icon={HiOutlineUserGroup} label="Total Evaluators" value={totals.evaluators} color="info" />
      </div>

      {stats.length === 0 ? (
        <EmptyState
          icon={HiOutlineChartBar}
          title="No statistics available"
          message="There are no award categories with activity to report yet."
        />
      ) : (
        <div className="reports-table-wrap">
          <table className="reports-data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th className="num">Nominations</th>
                <th className="num">Approved</th>
                <th className="num">Rejected</th>
                <th className="num">Total Votes</th>
                <th className="num">Evaluators</th>
                <th className="num">Avg Vote/Nominee</th>
                <th className="num">Avg Judge Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.categoryId}>
                  <td className="reports-cat-name">{s.categoryName}</td>
                  <td className="num">{s.totalNominations ?? 0}</td>
                  <td className="num">{s.approvedNominations ?? 0}</td>
                  <td className="num">{s.rejectedNominations ?? 0}</td>
                  <td className="num">{s.totalVotes ?? 0}</td>
                  <td className="num">{s.totalEvaluators ?? 0}</td>
                  <td className="num">{(s.avgVoteScore ?? 0).toFixed(1)}</td>
                  <td className="num">{(s.avgJudgeScore ?? 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
