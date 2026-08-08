import React from 'react';
import './ui.css';

export const Spinner = ({ size = 24, className = '' }) => (
  <div 
    className={`spinner ${className}`} 
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);
