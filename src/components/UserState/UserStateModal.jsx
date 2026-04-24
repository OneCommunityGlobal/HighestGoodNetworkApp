import { faGear } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { boxStyle, boxStyleDark } from '~/styles';
import { ENDPOINTS } from '~/utils/URL';
import { getStateColor } from './constants';
import styles from './UserState.module.css';

function logError(context, error) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(`[UserStateModal] ${context}:`, error?.message || error);
  }
}

function UserStateModal({
  isOpen,
  onClose,
  userId,
  userName,
  catalog,
  selected,
  onSelectionChange,
  darkMode,
  canManage,
  onOpenManage,
}) {
  const boxStyling = darkMode ? boxStyleDark : boxStyle;
  const fontColor = darkMode ? 'text-light' : '';
  const themeClass = darkMode ? styles.dark : styles.light;

  const [localSelected, setLocalSelected] = useState(selected);

  useEffect(() => {
    setLocalSelected(selected);
  }, [isOpen, selected]);

  const handleToggle = key => {
    setLocalSelected(prev => {
      const isItemSelected = prev.some(s => s.key === key);
      return isItemSelected
        ? prev.filter(s => s.key !== key)
        : [...prev, { key, selectedAt: new Date().toISOString() }];
    });
  };

  const handleDone = async () => {
    const previous = selected;
    onSelectionChange(userId, localSelected);
    const count = localSelected.length;
    toast.success(
      count > 0
        ? `${count} state${count !== 1 ? 's' : ''} assigned to ${userName}`
        : `States cleared for ${userName}`,
    );
    onClose();
    try {
      await axios.put(ENDPOINTS.USER_STATE_SELECTION(userId), {
        selectedKeys: localSelected.map(s => s.key),
        requestor: { role: 'Owner' },
      });
    } catch (err) {
      logError('handleDone', err);
      toast.error('Failed to save state selection, changes reverted');
      onSelectionChange(userId, previous);
    }
  };

  const handleClose = () => {
    setLocalSelected(selected);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} toggle={handleClose} className={darkMode ? 'text-light' : ''} centered>
      <ModalHeader toggle={handleClose} className={darkMode ? 'bg-space-cadet' : ''}>
        Set State {userName ? `— ${userName}` : ''}
      </ModalHeader>

      <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p
          className={fontColor}
          style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}
        >
          Select one or more states:
        </p>

        <div className={`${styles.stateToggleGrid} ${themeClass}`}>
          {catalog.map(item => {
            const isItemSelected = localSelected.some(s => s.key === item.key);
            const { bg, text } = getStateColor(item.color, darkMode);
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleToggle(item.key)}
                className={`${styles.stateToggleBtn} ${
                  !isItemSelected ? styles.unselectedToggle : ''
                } ${themeClass}`}
                style={
                  isItemSelected
                    ? {
                        background: bg,
                        color: text,
                        border: `2px solid ${bg}`,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        opacity: 1,
                      }
                    : {
                        border: `2px solid ${bg}`,
                        opacity: 0.7,
                        boxShadow: 'none',
                      }
                }
              >
                {isItemSelected && <span>✓</span>}
                {item.emoji ? `${item.emoji} ${item.label}` : item.label}
              </button>
            );
          })}
        </div>

        {localSelected.length > 0 && (
          <div className={`${styles.currentlySelectedSection} ${themeClass}`}>
            <p
              className={fontColor}
              style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}
            >
              Currently selected:
            </p>
            <div className={styles.currentlySelectedRow}>
              {catalog
                .filter(c => localSelected.some(s => s.key === c.key))
                .map(item => {
                  const { bg, text } = getStateColor(item.color, darkMode);
                  return (
                    <span
                      key={item.key}
                      className={styles.currentlySelectedBadge}
                      style={{ background: bg, color: text }}
                    >
                      {item.emoji ? `${item.emoji} ${item.label}` : item.label}
                      <button
                        type="button"
                        onClick={() => handleToggle(item.key)}
                        className={styles.currentlySelectedRemoveBtn}
                        aria-label={`Remove ${item.label}`}
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div className="d-flex w-100 align-items-center">
          {canManage && (
            <Button
              color="secondary"
              onClick={() => {
                onClose();
                onOpenManage();
              }}
              style={boxStyling}
            >
              <FontAwesomeIcon icon={faGear} className="mr-1" /> Manage States
            </Button>
          )}
          <div className="ml-auto d-flex" style={{ gap: '0.5rem' }}>
            <Button color="success" onClick={handleDone} style={boxStyling}>
              Done
            </Button>
            <Button color="primary" onClick={handleClose} style={boxStyling}>
              Cancel
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
}

UserStateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string.isRequired,
  userName: PropTypes.string,
  catalog: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string,
      emoji: PropTypes.string,
      color: PropTypes.string,
    }),
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.shape({ key: PropTypes.string })).isRequired,
  onSelectionChange: PropTypes.func.isRequired,
  darkMode: PropTypes.bool.isRequired,
  canManage: PropTypes.bool,
  onOpenManage: PropTypes.func,
};

UserStateModal.defaultProps = {
  userName: '',
  canManage: false,
  onOpenManage: () => {},
};

export default UserStateModal;
