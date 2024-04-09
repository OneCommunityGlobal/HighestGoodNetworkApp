import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';


const TOKEN_HAS_SETUP = 'SETUP_ALREADY_COMPLETED';
const TOKEN_CANCEL = 'CANCELLED';
const TOKEN_EXPIRED = 'EXPIRED';
const TOKEN_NOT_FOUND = 'NOT_FOUND';

const TOKEN_HAS_SETUP_MESSAGE = <>The link you've attempted to use has been <strong>setup already</strong>. </>;
const TOKEN_CANCEL_MESSAGE = <>The link you've attempted to use has been <strong>cancelled by the admin</strong>.</>;
const TOKEN_INVALID_MESSAGE = <>The link you've attempted to use is <strong>invalid</strong>.</>;
const TOKEN_EXPIRED_MESSAGE = <>The link you've attempted to use is <strong>expired</strong>.</>;
const TOKEN_NOT_FOUND_MESSAGE = <>The link you've attempted to use is <strong>not found</strong>.</>;


const SetupProfileInvalidToken = (props) => {
  /**
   * The error mesasge value is retrieved from the backend and passed by the parent component
   * to display the message.
   */
  const message = props.message;
  const displayMessage = (message) => {
  switch (message) {
    case TOKEN_HAS_SETUP:
     return  TOKEN_HAS_SETUP_MESSAGE;
    case TOKEN_CANCEL:
      return TOKEN_CANCEL_MESSAGE;
    case TOKEN_EXPIRED:
      return TOKEN_EXPIRED_MESSAGE;
    case TOKEN_NOT_FOUND:
      return TOKEN_NOT_FOUND_MESSAGE;
    default:
      return TOKEN_INVALID_MESSAGE;
  }};

  return (
    <div className="invalid-token-container">
      <div className="invalid-token-card">
        <div className="invalid-token-card-header">
          <FontAwesomeIcon icon={faExclamationTriangle} className="tringle-icon" />
        </div>
        <div className="invalid-token-card-title">Invalid Link</div>
        <div className="invalid-token-card-message">
          <p>
            {displayMessage(message)}
            <br />
            If you think this was in error, please let us know by replying to your onboarding email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupProfileInvalidToken;
