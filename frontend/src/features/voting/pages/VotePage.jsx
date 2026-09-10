import { useEffect, useMemo, useState } from 'react';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineThumbUp, HiOutlineUserGroup } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { votingApi } from '../api';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Loader from '../../../components/Loader';
import './VotePage.css';

const DEFAULT_VOTING_DATA = [
  {
    categoryId: 1,
    categoryName: 'Outstanding Research Innovation',
    description: 'Recognizing bold scientific ideas and measurable impact in research, design, and innovation.',
    votingEndDate: '2026-09-25T23:59:00',
    maxVotesPerVoter: 1,
    nominees: [
      { nomineeId: 101, name: 'Dr. Sarah Chen', organization: 'Global Research Institute', score: 92 },
      { nomineeId: 102, name: 'Prof. Daniel Moyo', organization: 'Urban Systems Lab', score: 88 },
      { nomineeId: 103, name: 'Aisha Rahman', organization: 'Future Compute Society', score: 90 },
    ],
  },
  {
    categoryId: 2,
    categoryName: 'Community Impact & Leadership',
    description: 'Celebrating leadership that creates practical, measurable benefits for communities and social change.',
    votingEndDate: '2026-09-30T23:59:00',
    maxVotesPerVoter: 1,
    nominees: [
      { nomineeId: 201, name: 'James Rodriguez', organization: 'EcoAid Collective', score: 95 },
      { nomineeId: 202, name: 'Nimal Perera', organization: 'Civic Futures Network', score: 89 },
      { nomineeId: 203, name: 'Tariq Bell', organization: 'Youth Pathways Fund', score: 91 },
    ],
  },
  {
    categoryId: 3,
    categoryName: 'Technology Innovation of the Year',
    description: 'Honoring standout technology products and digital solutions that solve real-world problems.',
    votingEndDate: '2026-10-05T23:59:00',
    maxVotesPerVoter: 1,
    nominees: [
      { nomineeId: 301, name: 'Aisha Patel', organization: 'TechLabs Studio', score: 94 },
      { nomineeId: 302, name: 'Leo Martins', organization: 'BluePeak Systems', score: 87 },
      { nomineeId: 303, name: 'Priya Nair', organization: 'SignalForge', score: 90 },
    ],
  },
];

export default function VotePage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({});
  const [submittedVotes, setSubmittedVotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await votingApi.getOpenCategories();
        const data = res?.data?.data?.length ? res.data.data : DEFAULT_VOTING_DATA;
        setCategories(data);
      } catch (err) {
        console.warn('Vote API unavailable, using demo data.', err);
        setCategories(DEFAULT_VOTING_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
        voterId: user?.userId || 1,
      });

      setSubmittedVotes((prev) => ({ ...prev, [category.categoryId]: nomineeId }));
      toast.success(`Vote submitted for ${category.categoryName}`);
    } catch (err) {
      console.warn('Server vote submission unavailable; saved locally for demo.', err);
      setSubmittedVotes((prev) => ({ ...prev, [category.categoryId]: nomineeId }));
      toast.success(`Demo vote saved for ${category.categoryName}`);
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
                <span>Max votes per voter: {category.maxVotesPerVoter}</span>
              </div>

              <div className="vote-option-list">
                {category.nominees.map((nominee) => {
                  const isSelected = selectedId === nominee.nomineeId;
                  const isSubmitted = alreadySubmitted && selectedVotes[category.categoryId] === nominee.nomineeId;

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
                          <strong>{nominee.name}</strong>
                          <span>{nominee.score}/100</span>
                        </div>
                        <small>{nominee.organization}</small>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="vote-card-footer">
                <span>
                  {selectedId ? 'Candidate selected' : 'No candidate selected yet'}
                </span>
                <Button
                  variant={alreadySubmitted ? 'secondary' : 'primary'}
                  size="md"
                  onClick={() => handleSubmitVote(category)}
                  disabled={alreadySubmitted}
                >
                  {alreadySubmitted ? 'Submitted' : 'Submit Vote'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
