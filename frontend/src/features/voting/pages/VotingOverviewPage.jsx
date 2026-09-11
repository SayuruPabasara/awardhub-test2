import { useState, useEffect, useCallback } from 'react';
import { HiOutlineChartBar, HiOutlineClock, HiOutlineThumbUp, HiOutlineUserGroup } from 'react-icons/hi';
import { categoryApi } from '../../categories/api';
import { reportsApi } from '../../reports/api';
import StatCard from '../../../components/StatCard';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import './VotingOverviewPage.css';

const formatDate = (value) => {
  if (!value) return 'TBD';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'VOTING_OPEN':
      return <Badge variant="success">Voting Open</Badge>;
    case 'NOMINATIONS_OPEN':
      return <Badge variant="warning">Nominations Open</Badge>;
    case 'UNDER_EVALUATION':
      return <Badge variant="info">Under Evaluation</Badge>;
    case 'PUBLISHED':
      return <Badge variant="accent">Results Published</Badge>;
    case 'UPCOMING':
      return <Badge variant="neutral">Upcoming</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

export default function VotingOverviewPage() {
  const [categories, setCategories] = useState([]);
  const [voteStats, setVoteStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [catRes, statsRes] = await Promise.all([
        categoryApi.getAll(),
        reportsApi.getAllCategoryStatistics().catch(() => ({ data: { data: [] } })),
      ]);

      const cats = catRes.data?.data || [];
      setCategories(cats);

      const statsMap = {};
      const stats = statsRes.data?.data || [];
      for (const s of stats) {
        if (s.categoryId) {
          statsMap[s.categoryId] = s;
        }
      }
      setVoteStats(statsMap);
    } catch (err) {
      console.error(err);
      setError('Failed to load voting overview. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const votingOpenCount = categories.filter((c) => c.status === 'VOTING_OPEN').length;
  const totalVotes = Object.values(voteStats).reduce(
    (sum, s) => sum + (s.totalVotes || 0),
    0
  );
  const totalEvaluators = Object.values(voteStats).reduce(
    (sum, s) => sum + (s.totalEvaluators || 0),
    0
  );

  if (loading) return <Loader text="Loading voting overview..." />;

  if (error) {
    return (
      <EmptyState
        icon={HiOutlineChartBar}
        title="Could not load voting overview"
        message={error}
        action={<button className="btn btn-primary" onClick={loadData}>Retry</button>}
      />
    );
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={HiOutlineChartBar}
        title="No categories yet"
        message="Award categories must be created before voting activity can be tracked."
      />
    );
  }

  return (
    <div className="voting-overview-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Voting Overview</h1>
          <p>Track voting activity and participation across all award categories.</p>
        </div>
      </div>

      <div className="vo-stats-grid">
        <StatCard icon={HiOutlineClock} label="Open for Voting" value={votingOpenCount} color="success" />
        <StatCard icon={HiOutlineThumbUp} label="Total Votes Cast" value={totalVotes} color="accent" />
        <StatCard icon={HiOutlineUserGroup} label="Total Evaluators" value={totalEvaluators} color="info" />
        <StatCard icon={HiOutlineChartBar} label="Total Categories" value={categories.length} color="primary" />
      </div>

      <div className="vo-category-list">
        {categories.map((cat) => {
          const stats = voteStats[cat.categoryId];
          const totalVotes = stats?.totalVotes ?? 0;
          const approvedNominations = stats?.approvedNominations ?? 0;

          return (
            <div key={cat.categoryId} className="vo-category-card">
              <div className="vo-card-header">
                <div>
                  <h3>{cat.categoryName}</h3>
                  <p>{cat.description}</p>
                </div>
                {getStatusBadge(cat.status)}
              </div>

              <div className="vo-card-body">
                <div className="vo-metric">
                  <span className="vo-metric-label">Approved Nominees</span>
                  <span className="vo-metric-value">{approvedNominations}</span>
                </div>
                <div className="vo-metric">
                  <span className="vo-metric-label">Votes Cast</span>
                  <span className="vo-metric-value">{totalVotes}</span>
                </div>
                <div className="vo-metric">
                  <span className="vo-metric-label">Voting Closes</span>
                  <span className="vo-metric-value">{formatDate(cat.votingEndDate)}</span>
                </div>
                <div className="vo-metric">
                  <span className="vo-metric-label">Max Votes / Voter</span>
                  <span className="vo-metric-value">{cat.maxVotesPerVoter ?? 1}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
