import { useEffect, useMemo, useState, useCallback } from 'react';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineThumbUp, HiOutlineUserGroup, HiOutlineInbox } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { votingApi } from '../api';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import EmptyState from '../../../components/EmptyState';
import './VotePage.css';

export default function VotePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [submittedVotes, setSubmittedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const catRes = await votingApi.getOpenCategories();
      const cats = catRes.data?.data || [];

      // Fetch approved nominees for each open category
      const categoriesWithNominees = await Promise.all(
        cats.map(async (cat) => {
          try {
            const nomineeRes = await votingApi.getApprovedNominees(cat.categoryId);
            return { ...cat, nominees: nomineeRes.data?.data || [] };
          } catch {
            return { ...cat, nominees: [] };
          }
        })
      );

      // Fetch the voter's previously submitted votes to mark completed categories
      const votedMap = {};
      try {
        const myVotesRes = await votingApi.getMyVotes();
        const myVotes = myVotesRes.data?.data || [];
        for (const vote of myVotes) {
          if (vote.categoryId) {
            votedMap[vote.categoryId] = vote.nomineeId;
          }
        }
      } catch {
        // Non-critical — continue without vote history
      }

      setCategories(categoriesWithNominees);
      setSubmittedVotes(votedMap);
    } catch (err) {
      console.error(err);
      setError('Failed to load voting categories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalSelections = Object.keys(selectedVotes).length;
  const totalSubmitted = Object.keys(submittedVotes).length;

  const summaryCards = useMemo(
    () => [
      {
        label: 'Open Categories',
        value: categories.length,
        icon: HiOutlineUserGroup,
      },
      {
        label: 'Selected So Far',
        value: totalSelections,
        icon: HiOutlineThumbUp,
      },
      {
        label: 'Votes Submitted',
        value: totalSubmitted,
        icon: HiOutlineCheckCircle,
      },
    ],
    [categories.length, totalSelections, totalSubmitted]
  );

  const handleSelect = (categoryId, nomineeId) => {
    setSelectedVotes((prev) => ({ ...prev, [categoryId]: nomineeId }));
  };

  const handleSubmitVote = async (category) => {
    const nomineeId = selectedVotes[category.categoryId];

    if (!nomineeId) {
      toast.error('Please choose a nominee before submitting your vote.');
      return;
    }

    try {
      await votingApi.submitVote({
        categoryId: category.categoryId,
        nomineeId,
      });

      setSubmittedVotes((prev) => ({ ...prev, [category.categoryId]: nomineeId }));
      toast.success(`Vote submitted for ${category.categoryName}`);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not submit your vote. Please try again.';
      toast.error(msg);
    }
  };

  const formatDate = (value) => {
    if (!value) return 'TBD';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) return <Loader text="Loading voting categories..." />;

  if (error) {
    return (
      <div className="vote-page">
        <EmptyState
          icon={HiOutlineUserGroup}
          title="Could not load voting"
          message={error}
          action={<Button onClick={loadData}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="vote-page">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Cast Your Vote</h1>
          <p>Review eligible nominees and submit your ballot before the deadline closes.</p>
        </div>
      </div>

      <div className="vote-summary-grid">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="vote-summary-card">
            <div className="vote-summary-icon">
              <Icon size={22} />
            </div>
            <div>
              <div className="vote-summary-value">{value}</div>
              <div className="vote-summary-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={HiOutlineInbox}
          title="No categories open for voting"
          message="There are no award categories open for voting at this time. Please check back later."
        />
      ) : (
        <div className="vote-list">
          {categories.map((category) => {
            const selectedId = selectedVotes[category.categoryId];
            const alreadySubmitted = !!submittedVotes[category.categoryId];

            return (
              <div key={category.categoryId} className="vote-card">
                <div className="vote-card-header">
                  <div>
                    <h2>{category.categoryName}</h2>
                    <p>{category.description}</p>
                  </div>
                  <Badge variant={alreadySubmitted ? 'success' : 'primary'}>
                    {alreadySubmitted ? 'Voted' : 'Open for Voting'}
                  </Badge>
                </div>

                <div className="vote-card-meta">
                  <span>
                    <HiOutlineClock size={15} />
                    Closes {formatDate(category.votingEndDate)}
                  </span>
                  <span>Max votes per voter: {category.maxVotesPerVoter ?? 1}</span>
                </div>

                {category.nominees.length === 0 ? (
                  <div className="vote-option-list">
                    <p className="vote-no-nominees">No approved nominees in this category yet.</p>
                  </div>
                ) : (
                  <div className="vote-option-list">
                    {category.nominees.map((nominee) => {
                      const isSelected = selectedId === nominee.nomineeId;
                      const isSubmitted =
                        alreadySubmitted && submittedVotes[category.categoryId] === nominee.nomineeId;

                      return (
                        <label
                          key={nominee.nomineeId}
                          className={`vote-option ${isSelected ? 'selected' : ''} ${isSubmitted ? 'submitted' : ''}`}
                        >
                          <input
                            type="radio"
                            name={`vote-${category.categoryId}`}
                            checked={isSelected}
                            onChange={() => handleSelect(category.categoryId, nominee.nomineeId)}
                            disabled={alreadySubmitted}
                          />
                          <div className="vote-option-main">
                            <div className="vote-option-title-row">
                              <strong>{nominee.nomineeName || nominee.nomineeEmail}</strong>
                            </div>
                            <small>{nominee.title}</small>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="vote-card-footer">
                  <span>
                    {selectedId ? 'Candidate selected' : 'No candidate selected yet'}
                  </span>
                  <Button
                    variant={alreadySubmitted ? 'secondary' : 'primary'}
                    size="md"
                    onClick={() => handleSubmitVote(category)}
                    disabled={alreadySubmitted || category.nominees.length === 0}
                  >
                    {alreadySubmitted ? 'Submitted' : 'Submit Vote'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
