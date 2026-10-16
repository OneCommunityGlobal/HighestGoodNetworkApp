import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  UncontrolledTooltip,
} from 'reactstrap';
import styles from './DuplicateTimeLogModal.module.css';

const WARNING =
  'Whoa there tiger, you’ve already submitted a time log exactly like this! Time logs need to be unique (and specific) or they’ll get flagged by the Time Log Administrator. Multiple flags will result in a blue square being issued.';

const TITLE_ID = 'duplicate-time-log-title';

function DuplicateTimeLogModal({ isOpen, onCancel, onEdit, onProceed, darkMode }) {
  const editButtonRef = useRef(null);

  const options = [
    {
      key: 'cancel',
      name: 'CANCEL',
      label: 'CANCEL — I don’t want duplicates',
      info:
        'Takes you to your time logs so you can review what you have already logged this week. Your timer is not reset and nothing is submitted.',
      color: 'secondary',
      onClick: onCancel,
    },
    {
      key: 'edit',
      name: 'EDIT',
      label: 'EDIT — I’ll update the description',
      info:
        'Returns you to the time log form with everything you entered preserved, so you can edit or improve the description before submitting.',
      color: 'primary',
      onClick: onEdit,
      isDefault: true,
    },
    {
      key: 'proceed',
      name: 'PROCEED',
      label: 'PROCEED — I understand the consequences',
      info:
        'Submits this time log exactly as entered, even though it matches one you already submitted. It may be flagged by the Time Log Administrator.',
      color: 'danger',
      onClick: onProceed,
    },
  ];

  // Escape and every other dismissal behave like EDIT, so closing never submits the duplicate.
  const handleDismiss = () => onEdit();

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleDismiss}
      backdrop="static"
      onOpened={() => editButtonRef.current?.focus()}
      labelledBy={TITLE_ID}
      contentClassName={darkMode ? `${styles.content} ${styles.darkContent}` : styles.content}
    >
      <ModalHeader id={TITLE_ID} className={darkMode ? styles.darkHeader : undefined}>
        Duplicate time log
      </ModalHeader>
      <ModalBody className={darkMode ? styles.darkBody : undefined}>
        <p className={styles.warning}>{WARNING}</p>
        <div className={styles.options}>
          {options.map(option => {
            const infoId = `duplicate-time-log-${option.key}-info`;
            return (
              <div className={styles.optionRow} key={option.key}>
                <Button
                  type="button"
                  color={option.color}
                  outline={!option.isDefault}
                  className={`${styles.optionButton} ${option.isDefault ? styles.defaultAction : ''}`}
                  innerRef={option.isDefault ? editButtonRef : undefined}
                  aria-keyshortcuts={option.isDefault ? 'Enter' : undefined}
                  onClick={() => option.onClick()}
                >
                  {option.label}
                </Button>
                <button
                  type="button"
                  id={infoId}
                  className={`${styles.infoButton} ${darkMode ? styles.darkInfoButton : ''}`}
                  aria-label={`Information about ${option.name}: ${option.info}`}
                >
                  <i className="fa fa-info-circle" aria-hidden="true" />
                </button>
                <UncontrolledTooltip target={infoId} placement="top" trigger="hover focus">
                  {option.info}
                </UncontrolledTooltip>
              </div>
            );
          })}
        </div>
      </ModalBody>
    </Modal>
  );
}

DuplicateTimeLogModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onProceed: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
};

DuplicateTimeLogModal.defaultProps = {
  darkMode: false,
};

export default DuplicateTimeLogModal;
