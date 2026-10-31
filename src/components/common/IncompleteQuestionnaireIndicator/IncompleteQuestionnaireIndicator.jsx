import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import styles from './IncompleteQuestionnaireIndicator.module.css';

export const INCOMPLETE_QUESTIONNAIRE_LABEL = 'Has not completed the HGN Questionnaire';

/**
 * Small badge shown next to a person's name when they have not completed
 * the HGN Questionnaire.
 */
function IncompleteQuestionnaireIndicator({ className = '' }) {
  return (
    <span
      className={`${styles.indicator} ${className}`}
      title={INCOMPLETE_QUESTIONNAIRE_LABEL}
      aria-label={INCOMPLETE_QUESTIONNAIRE_LABEL}
      role="img"
      data-testid="incomplete-questionnaire-indicator"
    >
      <FontAwesomeIcon icon={faClipboardList} />
      <span className={styles.badge}>!</span>
    </span>
  );
}

IncompleteQuestionnaireIndicator.propTypes = {
  className: PropTypes.string,
};

export default IncompleteQuestionnaireIndicator;
