import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { categoryApi } from '../../categories/api';
import { resultsApi } from '../api';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineStar, HiOutlineInbox } from 'react-icons/hi';
import './ResultsPage.css';

export default function ResultsPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [resultsByCategory, setResultsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [publishingId, setPublishingId] = useState(null);

  const isOrganizerOrAdmin =
    user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const catRes = await categoryApi.getAll();
      const cats = catRes.data?.data || [];
      setCategories(cats);

      const resultsMap = {};
      await Promise.all(
        cats.map(async (cat) => {
          try {
            const res = await resultsApi.getResultsByCategory(cat.categoryId);
            resultsMap[cat.categoryId] = res.data?.data || [];
          } catch {
            resultsMap[cat.categoryId] = [];
          }
        })
      );
      setResultsByCategory(resultsMap);
    } catch (err) {
      console.error(err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePublish = async (categoryId) => {
    try {
      setPublishingId(categoryId);
      await resultsApi.publishResults(categoryId);
      toast.success('Results calculated and published!');
      const res = await resultsApi.getResultsByCategory(categoryId);
      setResultsByCategory((prev) => ({ ...prev, [categoryId]: res.data?.data || [] }));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not publish results');
    } finally {
      setPublishingId(null);
    }
  };

  const publishedCount = Object.values(resultsByCategory).filter((r) => r.length > 0).length;
  const winnersCount = Object.values(resultsByCategory).reduce(
    (acc, list) => acc + list.filter((r) => r.isWinner).length,
    0
  );

  if (loading) {
    return (
      <div className="results-page">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-page">
        <EmptyState
          icon={HiOutlineChartBar}
          title="Could not load results"
          message={error}
          action={<Button onClick={loadData}>Retry</Button>}
        />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="results-page">
        <EmptyState
          title="No categories yet"
          message="Award categories must be created before results can be calculated."
        />
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Award Results</h1>
          <p>Final scores and winners across all award categories</p>
        </div>
      </div>

      <div className="results-summary-grid">
        <div className="results-summary-card">
          <div className="results-summary-icon"><HiOutlineChartBar size={22} /></div>
          <div>
            <div className="results-summary-value">{categories.length}</div>
            <div className="results-summary-label">Total Categories</div>
          </div>
        </div>
        <div className="results-summary-card">
          <div className="results-summary-icon"><HiOutlineStar size={22} /></div>
          <div>
            <div className="results-summary-value">{winnersCount}</div>
            <div className="results-summary-label">Winners Announced</div>
          </div>
        </div>
        <div className="results-summary-card">
          <div className="results-summary-icon"><HiOutlineTrendingUp size={22} /></div>
          <div>
            <div className="results-summary-value">{publishedCount}</div>
            <div className="results-summary-label">Published</div>
          </div>
        </div>
      </div>

      <div className="results-list">
        {categories.map((category) => {
          const scores = (resultsByCategory[category.categoryId] || [])
            .slice()
            .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0));
          const winner = scores.find((s) => s.isWinner) || null;
          const isPublished = scores.length > 0;

          return (
            <Card key={category.categoryId} className="results-card">
              <div className="results-card-header">
                <div>
                  <h2>{category.categoryName}</h2>
                  <p>
                    {isPublished
                      ? `${scores.length} nominee${scores.length !== 1 ? 's' : ''} evaluated`
                      : 'Results not yet calculated'}
                  </p>
                </div>
                {isOrganizerOrAdmin && (
                  <Button
                    variant={isPublished ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handlePublish(category.categoryId)}
                    disabled={publishingId === category.categoryId}
                  >
                    {publishingId === category.categoryId
                      ? 'Publishing…'
                      : isPublished
                        ? 'Recalculate'
                        : 'Publish Results'}
                  </Button>
                )}
              </div>

              {winner && (
                <div className="winner-banner">
                  <div className="winner-badge">🏆</div>
                  <div className="winner-text">
                    <strong>Winner</strong>
                    <h3>{winner.nomineeName}</h3>
                    <span>{(winner.finalScore ?? 0).toFixed(1)} points</span>
                  </div>
                </div>
              )}

              {isPublished ? (
                <div className="nominees-scores">
                  {scores.map((nominee) => (
                    <div key={nominee.scoreId || nominee.nomineeId} className="nominee-score-row">
                      <div className="score-rank">#{nominee.rank || '—'}</div>
                      <div className="score-info">
                        <strong>{nominee.nomineeName}</strong>
                        <div className="score-breakdown">
                          <span>Votes: {nominee.totalVotes ?? 0}</span>
                          <span>Judges: {nominee.totalEvaluations ?? 0}</span>
                        </div>
                      </div>
                      <div className="score-value">
                        <strong>{(nominee.finalScore ?? 0).toFixed(1)}</strong>
                        <span>/100</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={HiOutlineInbox}
                  title="No results yet"
                  message={
                    isOrganizerOrAdmin
                      ? 'Click "Publish Results" to calculate final scores from votes and evaluations.'
                      : 'Results for this category have not been published yet.'
                  }
                />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
