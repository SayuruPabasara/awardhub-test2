import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { authApi } from '../api';

export default function OtpVerifyPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }
    inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (idx, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    setError('');

    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    text.split('').forEach((ch, i) => { newOtp[i] = ch; });
    setOtp(newOtp);
    const focusIdx = Math.min(text.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await authApi.verifyOtp({ email, otp: otpString });
      if (data.success) {
        login(data.data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendOtp(email);
      setCountdown(300);
      setCanResend(false);
      setError('');
    } catch {
      setError('Failed to resend OTP');
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout>
      <div className="auth-form-header" style={{ textAlign: 'center' }}>
        <h1>Verify your email</h1>
        <p>We sent a 6-digit code to <strong>{email}</strong></p>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="otp-input-row" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="otp-digit"
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              aria-label={`Digit ${idx + 1}`}
            />
          ))}
        </div>

        <div className="otp-timer">
          {canResend ? (
            <button type="button" className="otp-resend" onClick={handleResend}>
              Resend code
            </button>
          ) : (
            <span>Code expires in {formatTime(countdown)}</span>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Verify & Continue
        </Button>
      </form>
    </AuthLayout>
  );
}
