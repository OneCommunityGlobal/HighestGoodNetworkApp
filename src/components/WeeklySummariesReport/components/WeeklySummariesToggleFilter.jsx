import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
import styles from '../WeeklySummariesReport.module.css';
import ReactTooltip from 'react-tooltip';
import { toggleField, setChildField } from '~/utils/stateHelper';
// import SlideToggle from './SlideToggle';
// import cn from 'classnames';

export default function WeeklySummariesToggleFilter({
  state,
  setState,
  hasPermissionToFilter,
  editable,
  formId,
  hasPermission,
  canSeeBioHighlight,
}) {
  // const safeColors = state.selectedSpecialColors || { purple: false, green: false, navy: false };

  const handleTrophyToggleChange = () => {
    toggleField(setState, 'selectedTrophies');
  };

  const handleBioStatusToggleChange = () => {
    toggleField(setState, 'selectedBioStatus');
  };

  const handleOverHoursToggleChange = () => {
    toggleField(setState, 'selectedOverTime');
  };

  // const handleSpecialColorToggleChange = (color, isEnabled) => {
  //   setState(prevState => ({
  //     ...prevState,
  //     selectedSpecialColors: {
  //       ...prevState.selectedSpecialColors,
  //       [color]: isEnabled,
  //     },
  //   }));
  // };

  return (
    <div className={`${styles.filterContainer}`}>
      {/* {hasPermissionToFilter && (
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
      )} */}
      {/* {(hasPermissionToFilter || canSeeBioHighlight) && (
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
      )} */}
      {/* {hasPermissionToFilter && (
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
                    // 🟢 FIX: Use safeColors here to prevent the crash
                    checked={safeColors[color] || false}
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
      {hasPermissionToFilter && state.selectedCodes.length > 0 && (
        <div className={cn(styles.filterStyle, styles.filterMarginRight, 'mt-2', 'mb-2', 'ml-7')}>
          <span className={styles.selectAllLabel}>Select All (Visible Users): </span>
          <div className={styles.dotSelector}>
            {['purple', 'green', 'navy'].map(color => (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
              <span
                key={color}
                onClick={e => {
                  e.preventDefault();
                  handleBulkDotClick(color);
                }}
                className={cn(styles.bulkDot, state.bulkSelectedColors[color] && styles.active)}
                style={{
                  display: 'inline-block',
                  width: '15px',
                  height: '15px',
                  margin: '0 5px',
                  borderRadius: '50%',
                  backgroundColor: state.bulkSelectedColors[color] ? color : 'transparent',
                  border: `3px solid ${color}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      )} */}
      {(hasPermissionToFilter || props.hasPermission('highlightEligibleBios')) && (
        <div
          className={`${styles.filterStyle} ${styles.marginRight}`}
          style={{ minWidth: 'max-content' }}
        >
          <span>Filter by Bio Status</span>
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
      {/* old */}
      {/* {hasPermissionToFilter && (
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
      )} */}
      {hasPermissionToFilter && (
        <div
          className={`${styles.filterStyle} ${styles.marginRight}`}
          style={{ minWidth: 'max-content' }}
        >
          <span>Filter by Trophies</span>
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
      {/* {hasPermissionToFilter && (
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
      )} */}
      {hasPermissionToFilter && (
        <div className={`${styles.filterStyle}`} style={{ minWidth: 'max-content' }}>
          <span>Filter by Over Hours</span>
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
};
