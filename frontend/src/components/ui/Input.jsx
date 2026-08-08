import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './ui.css';

export const Input = forwardRef(({ label, error, type = 'text', className = '', ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`input-group ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input 
          ref={ref}
          type={inputType}
          className={`input-field ${error ? 'input-error' : ''}`}
          style={isPassword ? { paddingRight: '2.5rem' } : {}}
          {...props} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0
            }}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
