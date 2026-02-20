import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
import styles from '../WeeklySummariesReport.module.css';
import ReactTooltip from 'react-tooltip';
import { toggleField } from '~/utils/stateHelper';

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
  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  const textColorClass = darkMode ? 'text-light' : '';
  console.log('Haspermission', hasPermission);
  return (
    <div className={`${styles.filterContainer}`}>
      {(hasPermissionToFilter || hasPermission?.('highlightEligibleBios')) && (
        <div
          className={`${styles.filterStyle} ${styles.marginRight}`}
          style={{ minWidth: 'max-content' }}
        >
          <span className={textColorClass}>Filter by Bio Status</span>
          <div className={styles.switchToggleControl}>
            <input
              type="checkbox"
              className={styles.switchToggle}
              id="bio-status-toggle"
              onChange={handleBioStatusToggleChange}
            />
            <Label className={styles.switchToggleLabel} htmlFor="bio-status-toggle">
              <span className={styles.switchToggleInner} />
              <span className={styles.switchToggleSwitch} />
            </Label>
          </div>
        </div>
      )}
      {hasPermissionToFilter && (
        <div
          className={`${styles.filterStyle} ${styles.marginRight}`}
          style={{ minWidth: 'max-content' }}
        >
          <span className={textColorClass}>Filter by Trophies</span>
          <div className={`${styles.switchToggleControl}`}>
            <input
              type="checkbox"
              className={`${styles.switchToggle}`}
              id="trophy-toggle"
              onChange={handleTrophyToggleChange}
            />
            <Label className={`${styles.switchToggleLabel}`} htmlFor="trophy-toggle">
              <span className={`${styles.switchToggleInner}`} />
              <span className={`${styles.switchToggleSwitch}`} />
            </Label>
          </div>
        </div>
      )}
      {hasPermissionToFilter && (
        <div className={`${styles.filterStyle}`} style={{ minWidth: 'max-content' }}>
          <span className={textColorClass}>Filter by Over Hours</span>
          <div className={`${styles.switchToggleControl}`}>
            <input
              type="checkbox"
              className={`${styles.switchToggle}`}
              id="over-hours-toggle"
              onChange={handleOverHoursToggleChange}
            />
            <Label className={`${styles.switchToggleLabel}`} htmlFor="over-hours-toggle">
              <span className={`${styles.switchToggleInner}`} />
              <span className={`${styles.switchToggleSwitch}`} />
            </Label>
          </div>
          <ReactTooltip id="filterTooltip" place="top" effect="solid" className="custom-tooltip">
            <span
              style={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                maxWidth: '200px',
              }}
            >
              Filter people who contributed more than 25% of their committed hours
            </span>
          </ReactTooltip>
        </div>
      )}{' '}
    </div>
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
