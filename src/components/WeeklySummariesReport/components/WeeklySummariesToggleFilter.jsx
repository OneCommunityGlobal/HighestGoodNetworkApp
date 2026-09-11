import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
import { useState, useEffect } from 'react';
import styles from '../WeeklySummariesReport.module.css';
import ReactTooltip from 'react-tooltip';
import { toggleField } from '~/utils/stateHelper';
import { SlideToggle } from '../components';

export default function WeeklySummariesToggleFilter({
  state,
  setState,
  hasPermissionToFilter,
  editable,
  formId,
  hasPermission,
  canSeeBioHighlight,
  darkMode,
}) {
  // Local state for optimistic UI update: immediately show selected bio status button
  const [pendingBioStatus, setPendingBioStatus] = useState(null);

  // Sync pending state with Redux state once Redux update completes
  useEffect(() => {
    setPendingBioStatus(state.selectedBioStatus);
  }, [state.selectedBioStatus]);

  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  // Bio Status Filter Handler: Toggle selected bio status between null (no filter) and specific status
  // Supports three states: 'default', 'requested', 'posted'
  // Clicking the same button twice will deselect it (set to null)
  // Uses optimistic update to immediately change button color on click
  const handleBioStatusChange = (e, status) => {
    e.preventDefault();
    e.stopPropagation();
    // Optimistic update: immediately show the new selection
    const newSelection = pendingBioStatus === status ? null : status;
    setPendingBioStatus(newSelection);
    // Update Redux state
    setState(prevState => ({
      ...prevState,
      selectedBioStatus: newSelection,
    }));
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  const textColorClass = darkMode ? `${styles.filterLabel} text-light` : styles.filterLabel;
  const bioStatusOptions = [
    { value: 'default', label: 'Not requested/posted' },
    { value: 'requested', label: 'Requested' },
    { value: 'posted', label: 'Posted' },
  ];

  return (
    <>
      {(hasPermissionToFilter || hasPermission?.('highlightEligibleBios')) && (
        <div className={styles.filterRow}>
          <div className={styles.specialColorsRow}>
            {/* Bio Status Filter Buttons: Three inline buttons for filtering by bio status
                - Not requested/posted: Shows users with default bio status
                - Requested: Shows users with requested bio status
                - Posted: Shows users with posted bio status
                Supports click-to-deselect behavior for flexible filtering */}
            <span className={styles.filterGroupLabel}>Filter by Bio Status:</span>
            {bioStatusOptions.map(option => (
              <div key={option.value} className={styles.specialColorsItem}>
                <span className={styles.specialColorsToggleWrap}>
                  <button
                    type="button"
                    className={styles.bioStatusButton}
                    onClick={e => handleBioStatusChange(e, option.value)}
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor:
                        pendingBioStatus === option.value ||
                        state.selectedBioStatus === option.value
                          ? '#007bff'
                          : '#fff',
                      color:
                        pendingBioStatus === option.value ||
                        state.selectedBioStatus === option.value
                          ? '#fff'
                          : '#000',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      outline: 'none',
                      boxShadow: 'none',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      transform: 'translateZ(0)',
                    }}
                    onMouseOver={e => {
                      if (
                        pendingBioStatus !== option.value &&
                        state.selectedBioStatus !== option.value
                      ) {
                        e.target.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onFocus={e => {
                      if (
                        pendingBioStatus !== option.value &&
                        state.selectedBioStatus !== option.value
                      ) {
                        e.target.style.backgroundColor = '#f0f0f0';
                      }
                    }}
                    onMouseOut={e => {
                      if (
                        pendingBioStatus !== option.value &&
                        state.selectedBioStatus !== option.value
                      ) {
                        e.target.style.backgroundColor = '#fff';
                      }
                    }}
                    onBlur={e => {
                      if (
                        pendingBioStatus !== option.value &&
                        state.selectedBioStatus !== option.value
                      ) {
                        e.target.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    {pendingBioStatus === option.value || state.selectedBioStatus === option.value
                      ? '✓'
                      : ''}{' '}
                    {option.label}
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPermissionToFilter && (
        <div className={styles.filterRow}>
          <div className={styles.specialColorsRow}>
            <span className={styles.filterGroupLabel}>Filter by:</span>

            <div className={styles.specialColorsItem}>
              <span className={textColorClass}>Trophies</span>
              <div style={{ marginTop: '10px' }}>
                <SlideToggle
                  color="default"
                  onChange={() => toggleField(setState, 'selectedTrophies')}
                />
              </div>
            </div>

            <div className={styles.specialColorsItem}>
              <span className={textColorClass}>Over Hours</span>
              <div style={{ marginTop: '10px' }}>
                <SlideToggle
                  color="default"
                  onChange={() => toggleField(setState, 'selectedOverTime')}
                />
              </div>
              <ReactTooltip id="filterTooltip" place="top" effect="solid">
                <span style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}>
                  Filter people who contributed more than 25% of their committed hours
                </span>
              </ReactTooltip>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

WeeklySummariesToggleFilter.propTypes = {
  state: PropTypes.object.isRequired,
  setState: PropTypes.func.isRequired,
  hasPermissionToFilter: PropTypes.bool,
  editable: PropTypes.bool,
  formId: PropTypes.string.isRequired,
  hasPermission: PropTypes.func,
  canSeeBioHighlight: PropTypes.bool,
  darkMode: PropTypes.bool,
};
