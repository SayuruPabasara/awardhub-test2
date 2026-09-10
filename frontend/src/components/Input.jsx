import { useState } from 'react';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import './Input.css';

export default function Input({
  label,
  type = 'text',
  error,
  required = false,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-label" htmlFor={id}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        {Icon && (
          <span className="input-icon-left">
            <Icon size={18} />
          </span>
        )}
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          className={`input-field ${error ? 'input-error' : ''} ${Icon ? 'has-icon-left' : ''}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-icon-right"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
