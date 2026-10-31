import React from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList } from '@fortawesome/free-solid-svg-icons';
import styles from './IncompleteQuestionnaireIndicator.module.css';

export const INCOMPLETE_QUESTIONNAIRE_LABEL = 'Has not completed the HGN Questionnaire';

/**
 * Small badge shown next to a person's name when they have not completed
 * the HGN Questionnaire. `id` must be unique on the page (e.g. the user's id)
 * because the tooltip is anchored to it.
 */
function IncompleteQuestionnaireIndicator({ id, className = '' }) {
  const targetId = `incomplete-questionnaire-${id}`;
  return (
    <>
      <span
        id={targetId}
        className={`${styles.indicator} ${className}`}
        aria-label={INCOMPLETE_QUESTIONNAIRE_LABEL}
        role="img"
        data-testid="incomplete-questionnaire-indicator"
      >
        <FontAwesomeIcon icon={faClipboardList} />
        <span className={styles.badge}>!</span>
      </span>
      <UncontrolledTooltip placement="top" target={targetId}>
        {INCOMPLETE_QUESTIONNAIRE_LABEL}
      </UncontrolledTooltip>
    </>
  );
}

IncompleteQuestionnaireIndicator.propTypes = {
  id: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default IncompleteQuestionnaireIndicator;
