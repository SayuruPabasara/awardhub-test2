import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlinePhone,
  HiOutlineUserCircle,
  HiOutlineThumbUp,
  HiOutlineClipboardCheck,
  HiOutlineCollection,
  HiOutlineShieldCheck,
  HiOutlineIdentification,
} from 'react-icons/hi';
import AuthLayout from '../components/AuthLayout';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { authApi } from '../api';

const roles = [
  { value: 'NOMINEE', label: 'Nominee', desc: 'Submit nominations', icon: HiOutlineUserCircle },
  { value: 'VOTER', label: 'Voter', desc: 'Cast your vote', icon: HiOutlineThumbUp },
  { value: 'JUDGE', label: 'Judge', desc: 'Evaluate nominees', icon: HiOutlineClipboardCheck },
  { value: 'AWARD_ORGANIZER', label: 'Organizer', desc: 'Manage awards', icon: HiOutlineCollection },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=role, 2=details
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    role: '',
    nicPassport: '',
    nic: '',
    areaOfExpertise: '',
    position: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
    setError('');
  };

  const handleNext = () => {
    if (!form.role) {
      setError('Please select a role');
      return;
    }
    setStep(2);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        email: form.email,
        password: form.password,
        role: form.role,
        contactNumber: form.contactNumber,
      };

      // Add role-specific fields
      if (form.role === 'NOMINEE') payload.nicPassport = form.nicPassport;
      if (form.role === 'VOTER') payload.nic = form.nic;
      if (form.role === 'JUDGE') payload.areaOfExpertise = form.areaOfExpertise;
      if (form.role === 'AWARD_ORGANIZER') payload.position = form.position;

      const { data } = await authApi.register(payload);
      if (data.success) {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-form-header">
        <h1>{step === 1 ? 'Create your account' : 'Complete registration'}</h1>
        <p>{step === 1 ? 'Select your role to get started' : `Registering as ${roles.find(r => r.value === form.role)?.label}`}</p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      {step === 1 ? (
        <div className="auth-form">
          <div className="role-selector">
            {roles.map((r) => (
              <div
                key={r.value}
                className={`role-option ${form.role === r.value ? 'selected' : ''}`}
                onClick={() => handleRoleSelect(r.value)}
              >
                <span className="role-option-icon"><r.icon size={20} /></span>
                <span className="role-option-label">{r.label}</span>
                <span className="role-option-desc">{r.desc}</span>
              </div>
            ))}
          </div>
          <Button fullWidth size="lg" onClick={handleNext} disabled={!form.role}>
            Continue
          </Button>
          <div className="auth-form-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="register-email"
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            icon={HiOutlineMail}
            required
          />
          <Input
            id="register-password"
            label="Password"
            type="password"
            name="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            icon={HiOutlineLockClosed}
            required
          />
          <Input
            id="register-confirm-password"
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            icon={HiOutlineLockClosed}
            required
          />
          <Input
            id="register-phone"
            label="Contact Number"
            type="tel"
            name="contactNumber"
            placeholder="+94 7X XXX XXXX"
            value={form.contactNumber}
            onChange={handleChange}
            icon={HiOutlinePhone}
          />

          {/* Role-specific fields */}
          {form.role === 'NOMINEE' && (
            <Input
              id="register-nic-passport"
              label="NIC / Passport Number"
              name="nicPassport"
              placeholder="Enter your NIC or passport"
              value={form.nicPassport}
              onChange={handleChange}
              icon={HiOutlineIdentification}
              required
            />
          )}
          {form.role === 'VOTER' && (
            <Input
              id="register-nic"
              label="NIC Number"
              name="nic"
              placeholder="Enter your NIC for identity verification"
              value={form.nic}
              onChange={handleChange}
              icon={HiOutlineIdentification}
              required
            />
          )}
          {form.role === 'JUDGE' && (
            <Input
              id="register-expertise"
              label="Area of Expertise"
              name="areaOfExpertise"
              placeholder="e.g. Technology, Education, Arts"
              value={form.areaOfExpertise}
              onChange={handleChange}
              icon={HiOutlineShieldCheck}
            />
          )}
          {form.role === 'AWARD_ORGANIZER' && (
            <Input
              id="register-position"
              label="Position"
              name="position"
              placeholder="e.g. Program Director"
              value={form.position}
              onChange={handleChange}
              icon={HiOutlineShieldCheck}
            />
          )}

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" size="lg" onClick={() => setStep(1)} style={{ flex: 1 }}>
              Back
            </Button>
            <Button type="submit" size="lg" loading={loading} style={{ flex: 2 }}>
              Create Account
            </Button>
          </div>

          <div className="auth-form-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
