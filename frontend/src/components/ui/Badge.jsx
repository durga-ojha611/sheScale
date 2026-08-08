import React from 'react';
import './ui.css';

export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>
    {children}
  </span>
);
