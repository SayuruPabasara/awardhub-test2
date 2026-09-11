import { Link } from 'react-router-dom';
import {
  HiOutlineDocumentText,
  HiOutlineThumbUp,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineLightningBolt,
  HiOutlineArrowRight,
} from 'react-icons/hi';
import Button from '../../../components/Button';
import './LandingPage.css';

const features = [
  {
    icon: HiOutlineDocumentText,
    title: 'Nomination Management',
    description:
      'Streamline the submission process with structured categories, document uploads, and review workflows.',
  },
  {
    icon: HiOutlineThumbUp,
    title: 'Secure Voting',
    description:
      'Verified voter authentication and one-vote-per-category enforcement ensure fair and transparent results.',
  },
  {
    icon: HiOutlineClipboardCheck,
    title: 'Expert Evaluations',
    description:
      'Rubric-based judge scoring with weighted criteria and detailed evaluation reports.',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Analytics & Results',
    description:
      'Real-time statistics, automated scoring, and publishable award ceremony results.',
  },
];

const steps = [
  { number: '01', title: 'Register', description: 'Create your account as a nominee, voter, or judge.' },
  { number: '02', title: 'Nominate', description: 'Submit entries into award categories with supporting documents.' },
  { number: '03', title: 'Vote & Evaluate', description: 'Voters cast ballots; judges score based on rubrics.' },
  { number: '04', title: 'Results', description: 'Weighted scores are tallied and winners are announced.' },
];

const roles = [
  { icon: HiOutlineUsers, title: 'Nominees', description: 'Submit your achievements for recognition across award categories.' },
  { icon: HiOutlineThumbUp, title: 'Voters', description: 'Cast your vote to help decide who deserves to win.' },
  { icon: HiOutlineShieldCheck, title: 'Judges', description: 'Provide expert evaluations with structured scoring rubrics.' },
  { icon: HiOutlineLightningBolt, title: 'Organizers', description: 'Manage the entire award lifecycle from setup to results.' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <div className="landing-nav-logo">A</div>
            <span className="landing-nav-title">AwardHub</span>
          </div>
          <div className="landing-nav-actions">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-bg-orb landing-hero-bg-orb--1" />
        <div className="landing-hero-bg-orb landing-hero-bg-orb--2" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">Award Management Platform</div>
          <h1 className="landing-hero-title">
            Recognize Excellence.
            <br />
            <span className="landing-hero-accent">Celebrate Achievement.</span>
          </h1>
          <p className="landing-hero-subtitle">
            AwardHub is the all-in-one platform for managing award nominations, secure voting,
            expert evaluations, and publishing results — from submission to ceremony.
          </p>
          <div className="landing-hero-cta">
            <Link to="/register">
              <Button variant="primary" size="lg" icon={HiOutlineArrowRight}>
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Everything You Need</h2>
          <p>A complete toolkit for running fair, transparent, and efficient award programs.</p>
        </div>
        <div className="landing-features-grid">
          {features.map((f, i) => (
            <div key={i} className="landing-feature-card">
              <div className="landing-feature-icon">
                <f.icon size={24} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section--alt">
        <div className="landing-section-header">
          <h2>How It Works</h2>
          <p>From registration to results in four simple steps.</p>
        </div>
        <div className="landing-steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="landing-step-card">
              <div className="landing-step-number">{s.number}</div>
              <h3>{s.title}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Built for Every Role</h2>
          <p>Whether you nominate, vote, judge, or organize — AwardHub has you covered.</p>
        </div>
        <div className="landing-roles-grid">
          {roles.map((r, i) => (
            <div key={i} className="landing-role-card">
              <div className="landing-role-icon">
                <r.icon size={28} />
              </div>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-cta-section">
        <div className="landing-cta-inner">
          <h2>Ready to Get Started?</h2>
          <p>Create your account and start managing your award program today.</p>
          <Link to="/register">
            <Button variant="primary" size="lg" icon={HiOutlineArrowRight}>
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-nav-logo">A</div>
            <span>AwardHub</span>
          </div>
          <p className="landing-footer-copy">
            &copy; {new Date().getFullYear()} AwardHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
