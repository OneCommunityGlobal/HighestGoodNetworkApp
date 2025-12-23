import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
import styles from './WeeklySummariesReport.module.css';
import ReactTooltip from 'react-tooltip';
import { toggleField, setChildField } from '~/utils/stateHelper';

export default function WeeklySummariesToggleFilter({
  state,
  setState,
  hasPermissionToFilter,
  editable,
  formId,
  hasPermission,
  canSeeBioHighlight,
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
  return (
    <div className={`${styles.filterContainer}`}>
      {hasPermissionToFilter && (
        <div className={`${styles.filterStyle}`}>
          <span>Filter by Special Colors</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            {['purple', 'green', 'navy'].map(color => (
              <div key={`${color}-toggle`} style={{ display: 'flex', alignItems: 'center' }}>
                <div className={`${styles.switchToggleControl}`}>
                  <input
                    type="checkbox"
                    className={`${styles.switchToggle}`}
                    id={`${formId}-${color}-toggle`}
                    checked={state.selectedSpecialColors[color]}
                    disabled={!editable}
                    onChange={e =>
                      setChildField(setState, 'selectedSpecialColors', color, e.target.checked)
                    }
                  />
                  <Label
                    className={`${styles.switchToggleLabel}`}
                    for={`${formId}-${color}-toggle`}
                  >
                    <span className={`${styles.switchToggleInner}`} />
                    <span className={`${styles.switchToggleSwitch}`} />
                  </Label>
                </div>
                <span
                  style={{
                    marginLeft: '3px',
                    fontSize: 'inherit',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    fontWeight: 'normal',
                  }}
                >
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {(hasPermissionToFilter || canSeeBioHighlight) && (
        <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
          <span>Filter by Bio Status</span>
          <div className={styles.switchToggleControl}>
            <input
              type="checkbox"
              className={styles.switchToggle}
              id={`${formId}-bio-status-toggle`}
              checked={state.selectedBioStatus}
              disabled={!editable}
              onChange={handleBioStatusToggleChange}
            />
            <Label className={`${styles.switchToggleLabel}`} for={`${formId}-bio-status-toggle`}>
              <span className={styles.switchToggleInner} />
              <span className={styles.switchToggleSwitch} />
            </Label>
          </div>
        </div>
      )}
      {hasPermissionToFilter && (
        <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
          <span>Filter by Trophies</span>
          <div className={`${styles.switchToggleControl}`}>
            <input
              type="checkbox"
              className={`${styles.switchToggle}`}
              id={`${formId}-trophy-toggle`}
              checked={state.selectedTrophies}
              disabled={!editable}
              onChange={handleTrophyToggleChange}
            />
            <Label className={`${styles.switchToggleLabel}`} for={`${formId}-trophy-toggle`}>
              <span className={`${styles.switchToggleInner}`} />
              <span className={`${styles.switchToggleSwitch}`} />
            </Label>
          </div>
        </div>
      )}
      {hasPermissionToFilter && (
        <div className={`${styles.filterStyle} ml-3`} style={{ minWidth: 'max-content' }}>
          <span>Filter by Over Hours</span>
          <div className={`${styles.switchToggleControl}`}>
            <input
              type="checkbox"
              className={`${styles.switchToggle}`}
              id={`${formId}-over-hours-toggle`}
              checked={state.selectedOverTime}
              disabled={!editable}
              onChange={handleOverHoursToggleChange}
            />
            <Label className={`${styles.switchToggleLabel}`} for={`${formId}-over-hours-toggle`}>
              <span className={`${styles.switchToggleInner}`} />
              <span className={`${styles.switchToggleSwitch}`} />
            </Label>
          </div>
          <ReactTooltip id="filterTooltip" place="top" effect="solid" className="custom-tooltip">
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
};
