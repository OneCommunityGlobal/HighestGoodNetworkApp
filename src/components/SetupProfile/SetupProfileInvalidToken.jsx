import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
const SetupProfileInvalidToken = () => {
  return (
    <div className="invalid-token-container">
      <div className="invalid-token-card">
        <div className="invalid-token-card-header">
          <FontAwesomeIcon icon={faExclamationTriangle} className="tringle-icon" />
        </div>
        <div className="invalid-token-card-title">Invalid Link</div>
        <div className="invalid-token-card-message">
          <p>
            The link you have used has expired, is invalid, or has already been visited.
            <br />
            If you need help, feel free to contact the{' '}
            <span className="invalid-token-card-company-name">One Community</span> team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupProfileInvalidToken;
