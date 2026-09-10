import { useState, useEffect } from 'react';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineSparkles,
  HiOutlineCheck,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { profileApi } from '../api';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import Loader from '../../../components/Loader';
import './NomineeProfilePage.css';

const DEFAULT_PROFILE = {
  nicPassport: '951234567V',
  dateOfBirth: '1995-04-12',
  gender: 'Female',
  contactNumber: '+94 77 123 4567',
  street: '42 Science Innovation Way',
  city: 'Colombo',
  state: 'Western Province',
  zip: '00700',
  organization: 'Institute of Robotics & Applied AI',
  jobTitle: 'Lead Research Scientist',
  biography:
    'Dedicated researcher and technologist specializing in autonomous aerial systems, edge compute, and disaster response robotics. Passionate about empowering developing communities through applied STEM innovation.',
  education: 'Ph.D. in Robotics — SLIIT (2024)\nB.Sc. (Hons) in Software Engineering (First Class) — SLIIT (2019)',
  achievements: '• Best Technical Paper Award (IEEE 2025)\n• National Youth Innovation Fellowship\n• 3 Patents in Autonomous Sensor Systems',
  references: 'Prof. Ananda Silva (Dean of Computing, SLIIT) — a.silva@sliit.lk\nDr. Maya Perera (Director of R&D, TechLabs) — maya@techlabs.io',
};

const TABS = [
  { id: 'OVERVIEW', label: 'Biography & Overview' },
  { id: 'PERSONAL', label: 'Personal & Demographics' },
  { id: 'CAREER', label: 'Career & Education' },
  { id: 'ACHIEVEMENTS', label: 'Achievements & References' },
];

export default function NomineeProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await profileApi.getMyProfile();
        if (res?.data?.data) {
          setProfile((prev) => ({ ...prev, ...res.data.data }));
        }
      } catch (err) {
        console.warn('API error, using demo profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await profileApi.updateMyProfile(profile);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.success('Profile updated locally (demo mode)!');
    } finally {
      setSaving(false);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      profile.nicPassport,
      profile.dateOfBirth,
      profile.gender,
      profile.contactNumber,
      profile.street,
      profile.city,
      profile.organization,
      profile.jobTitle,
      profile.biography,
      profile.education,
      profile.achievements,
      profile.references,
    ];
    const filled = fields.filter((f) => f && f.trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  };

  if (loading) return <Loader text="Loading your profile..." />;

  const completionPct = calculateCompletion();

  return (
    <div className="profile-page-container">
      {/* Header Banner */}
      <div className="profile-card-header-banner">
        <div className="profile-avatar-info">
          <div className="profile-avatar-circle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'N'}
          </div>
          <div className="profile-name-role">
            <h2>{user?.name || 'Nominee Profile'}</h2>
            <p>{profile.jobTitle || 'Researcher'} • {profile.organization || 'Independent'}</p>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--primary-300)' }}>
              {user?.email || 'nominee@awardhub.com'}
            </span>
          </div>
        </div>

        <div className="profile-meter-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', fontWeight: 600 }}>
            <span>Profile Completion</span>
            <span style={{ color: 'var(--accent-300)' }}>{completionPct}%</span>
          </div>
          <div className="profile-meter-bar">
            <div className="profile-meter-fill" style={{ width: `${completionPct}%` }} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs-bar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`profile-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave}>
        {activeTab === 'OVERVIEW' && (
          <Card title="Professional Summary & Biography">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="profile-field-full">
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Professional Biography
                </label>
                <textarea
                  name="biography"
                  value={profile.biography || ''}
                  onChange={handleChange}
                  rows={5}
                  className="category-form-textarea"
                  placeholder="Introduce yourself, your focus areas, career trajectory, and core ethos..."
                />
              </div>

              <div className="profile-form-grid">
                <Input
                  label="Current Organization / Institution"
                  name="organization"
                  value={profile.organization || ''}
                  onChange={handleChange}
                  placeholder="e.g. SLIIT"
                />
                <Input
                  label="Current Job Title / Designation"
                  name="jobTitle"
                  value={profile.jobTitle || ''}
                  onChange={handleChange}
                  placeholder="e.g. Senior Lecturer / Lead AI Engineer"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'PERSONAL' && (
          <Card title="Personal Details & Demographics">
            <div className="profile-form-grid">
              <Input
                label="NIC or Passport Number"
                name="nicPassport"
                value={profile.nicPassport || ''}
                onChange={handleChange}
                placeholder="National Identity Card number"
              />
              <Input
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={profile.dateOfBirth || ''}
                onChange={handleChange}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={profile.gender || ''}
                  onChange={handleChange}
                  className="category-form-select"
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              <Input
                label="Contact Number"
                name="contactNumber"
                value={profile.contactNumber || ''}
                onChange={handleChange}
                placeholder="+94 77 000 0000"
              />
              <Input
                label="Street Address"
                name="street"
                value={profile.street || ''}
                onChange={handleChange}
                placeholder="Street address"
              />
              <Input
                label="City"
                name="city"
                value={profile.city || ''}
                onChange={handleChange}
                placeholder="City"
              />
              <Input
                label="State / Province"
                name="state"
                value={profile.state || ''}
                onChange={handleChange}
                placeholder="Province or State"
              />
              <Input
                label="Postal / Zip Code"
                name="zip"
                value={profile.zip || ''}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>
          </Card>
        )}

        {activeTab === 'CAREER' && (
          <Card title="Academic Background & Career History">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="profile-field-full">
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Education & Qualifications (Degrees, Universities, Honors)
                </label>
                <textarea
                  name="education"
                  value={profile.education || ''}
                  onChange={handleChange}
                  rows={4}
                  className="category-form-textarea"
                  placeholder="e.g. Ph.D. in Computer Science — SLIIT (2024)..."
                />
              </div>

              <div className="profile-form-grid">
                <Input
                  label="Primary Organization"
                  name="organization"
                  value={profile.organization || ''}
                  onChange={handleChange}
                />
                <Input
                  label="Position / Designation"
                  name="jobTitle"
                  value={profile.jobTitle || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'ACHIEVEMENTS' && (
          <Card title="Key Achievements & Professional References">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="profile-field-full">
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Key Honors, Publications & Accolades
                </label>
                <textarea
                  name="achievements"
                  value={profile.achievements || ''}
                  onChange={handleChange}
                  rows={4}
                  className="category-form-textarea"
                  placeholder="List major awards, patents, papers, or career highlights..."
                />
              </div>

              <div className="profile-field-full">
                <label style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Professional References (Name, Title, Organization, Contact)
                </label>
                <textarea
                  name="references"
                  value={profile.references || ''}
                  onChange={handleChange}
                  rows={3}
                  className="category-form-textarea"
                  placeholder="Prof. John Doe (Department Head, SLIIT) — email@institution.edu..."
                />
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <Button
            variant="primary"
            type="submit"
            icon={HiOutlineCheck}
            loading={saving}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
