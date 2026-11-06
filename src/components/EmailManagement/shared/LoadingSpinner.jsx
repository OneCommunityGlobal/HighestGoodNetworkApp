import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import { FaSpinner } from 'react-icons/fa';

/**
 * Unified Loading Spinner Component
 * Consistent loading states across the entire email management system
 */
const LoadingSpinner = ({
  message = 'Loading...',
  size = 'md',
  type = 'border',
  showIcon = false,
  className = '',
  centered = true,
}) => {
  const sizeMap = {
    sm: { spinner: 'sm', text: '0.875rem', icon: 14 },
    md: { spinner: 'md', text: '1rem', icon: 16 },
    lg: { spinner: 'lg', text: '1.125rem', icon: 18 },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`loading-spinner-container ${centered ? 'text-center' : ''} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="d-flex align-items-center justify-content-center" style={{ gap: '8px' }}>
        {showIcon ? (
          <FaSpinner className="fa-spin" size={currentSize.icon} aria-hidden="true" />
        ) : (
          <Spinner size={currentSize.spinner} color="primary" type={type} aria-hidden="true" />
        )}
        {message && <span style={{ fontSize: currentSize.text }}>{message}</span>}
      </div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['border', 'grow']),
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  centered: PropTypes.bool,
};

LoadingSpinner.defaultProps = {
  message: 'Loading...',
  size: 'md',
  type: 'border',
  showIcon: false,
  className: '',
  centered: true,
};

export default LoadingSpinner;
