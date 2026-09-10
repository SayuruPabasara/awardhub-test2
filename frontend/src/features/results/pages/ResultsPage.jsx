import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Loader from '../../../components/Loader';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineStar } from 'react-icons/hi';
import './ResultsPage.css';

const DEMO_RESULTS = [
  {
    categoryId: 1,
    categoryName: 'Outstanding Research Innovation',
    winner: 'Dr. Sarah Chen',
    winning_score: 92.5,
    nominees: [
      { name: 'Dr. Sarah Chen', vote_score: 88, judge_score: 96, final_score: 92.5 },
      { name: 'Prof. Daniel Moyo', vote_score: 85, judge_score: 91, final_score: 88.5 },
      { name: 'Aisha Rahman', vote_score: 87, judge_score: 93, final_score: 90.5 },
    ],
    published: true,
  },
  {
    categoryId: 2,
    categoryName: 'Community Impact & Leadership',
    winner: 'James Rodriguez',
    winning_score: 95.0,
    nominees: [
      { name: 'James Rodriguez', vote_score: 95, judge_score: 95, final_score: 95.0 },
      { name: 'Nimal Perera', vote_score: 89, judge_score: 89, final_score: 89.0 },
      { name: 'Tariq Bell', vote_score: 91, judge_score: 91, final_score: 91.0 },
    ],
    published: true,
  },
  {
    categoryId: 3,
    categoryName: 'Technology Innovation of the Year',
    winner: null,
    winning_score: 0,
    nominees: [
      { name: 'Aisha Patel', vote_score: 90, judge_score: 98, final_score: 94.0 },
      { name: 'Leo Martins', vote_score: 82, judge_score: 92, final_score: 87.5 },
      { name: 'Priya Nair', vote_score: 88, judge_score: 92, final_score: 90.0 },
    ],
    published: false,
  },
];

export default function ResultsPage() {
  const { user } = useAuth();
  const [results, setResults] = useState(DEMO_RESULTS);
  const [loading, setLoading] = useState(false);
  const isOrganizerOrAdmin = user?.role === 'AWARD_ORGANIZER' || user?.role === 'SYSTEM_ADMINISTRATOR';

  const handlePublish = async (categoryId) => {
    try {
      setLoading(true);
      // Demo: just update local state
      setResults((prev) =>
        prev.map((r) => (r.categoryId === categoryId ? { ...r, published: true } : r))
      );
      toast.success('Results published for this category!');
    } catch (err) {
      console.error(err);
      toast.error('Could not publish results');
    } finally {
      setLoading(false);
    }
  };

  const totalCategories = results.length;
  const publishedCategories = results.filter((r) => r.published).length;

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
            <div className="results-summary-value">{totalCategories}</div>
            <div className="results-summary-label">Total Categories</div>
          </div>
        </div>
        <div className="results-summary-card">
          <div className="results-summary-icon"><HiOutlineStar size={22} /></div>
          <div>
            <div className="results-summary-value">
              {results.filter((r) => r.winner).length}
            </div>
            <div className="results-summary-label">Winners Announced</div>
          </div>
        </div>
        <div className="results-summary-card">
          <div className="results-summary-icon"><HiOutlineTrendingUp size={22} /></div>
          <div>
            <div className="results-summary-value">{publishedCategories}</div>
            <div className="results-summary-label">Published</div>
          </div>
        </div>
      </div>

      <div className="results-list">
        {results.map((category) => (
          <Card key={category.categoryId} className="results-card">
            <div className="results-card-header">
              <div>
                <h2>{category.categoryName}</h2>
                <p>{category.nominees.length} nominees evaluated</p>
              </div>
              {isOrganizerOrAdmin && (
                <Button
                  variant={category.published ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handlePublish(category.categoryId)}
                  disabled={category.published}
                >
                  {category.published ? 'Published' : 'Publish Results'}
                </Button>
              )}
            </div>

            {category.winner && (
              <div className="winner-banner">
                <div className="winner-badge">🏆</div>
                <div className="winner-text">
                  <strong>Winner</strong>
                  <h3>{category.winner}</h3>
                  <span>{category.winning_score.toFixed(1)} points</span>
                </div>
              </div>
            )}

            <div className="nominees-scores">
              {category.nominees
                .sort((a, b) => b.final_score - a.final_score)
                .map((nominee, idx) => (
                  <div key={idx} className="nominee-score-row">
                    <div className="score-rank">#{idx + 1}</div>
                    <div className="score-info">
                      <strong>{nominee.name}</strong>
                      <div className="score-breakdown">
                        <span>Votes: {nominee.vote_score}</span>
                        <span>Judges: {nominee.judge_score}</span>
                      </div>
                    </div>
                    <div className="score-value">
                      <strong>{nominee.final_score.toFixed(1)}</strong>
                      <span>/100</span>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
