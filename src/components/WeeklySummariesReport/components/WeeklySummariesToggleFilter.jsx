import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
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
  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  const textColorClass = darkMode ? `${styles.filterLabel} text-light` : styles.filterLabel;

  return (
    <div className={styles.specialColorsRow}>
      <span className={styles.filterGroupLabel}>Filter by:</span>

      {(hasPermissionToFilter || hasPermission?.('highlightEligibleBios')) && (
        <div className={styles.specialColorsItem}>
          <span className={textColorClass}>Bio Status</span>
          <div style={{ marginTop: '10px' }}>
            <SlideToggle
              color="default"
              onChange={() => toggleField(setState, 'selectedBioStatus')}
              style={{ marginTop: '20px' }}
            />
          </div>
        </div>
      )}

      {hasPermissionToFilter && (
        <div className={styles.specialColorsItem}>
          <span className={textColorClass}>Trophies</span>
          <div style={{ marginTop: '10px' }}>
            <SlideToggle
              color="default"
              onChange={() => toggleField(setState, 'selectedTrophies')}
            />
          </div>
        </div>
      )}

      {hasPermissionToFilter && (
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
      )}
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
