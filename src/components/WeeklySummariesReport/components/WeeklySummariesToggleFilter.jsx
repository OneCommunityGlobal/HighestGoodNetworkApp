import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import styles from '../WeeklySummariesReport.module.css';
import { toggleField } from '~/utils/stateHelper';
import { permissions } from '~/utils/constants';
import { BIO_MIN_DAYS_IN_TEAM, BIO_MIN_TANGIBLE_HOURS } from '~/utils/bioQualification';
import { SlideToggle } from '../components';

export default function WeeklySummariesToggleFilter({
  state,
  setState,
  hasPermissionToFilter,
  editable,
  formId,
  hasPermission,
  darkMode,
}) {
  // The preview form renders this read-only and passes no setState, so every
  // handler is a no-op there and the toggles stay pinned to the saved values.
  const toggle = field => {
    if (!editable || !setState) return;
    toggleField(setState, field);
  };

  // Bio Status is a plain on/off filter: off shows everyone, on narrows the list to
  // users still eligible to post a bio. The rule lives in isQualifiedForBio and is
  // tenure-based, not summary-count based — see the note there on the 2026-05-12
  // regression. The thresholds below are read from that module so this label cannot
  // drift away from the filter it describes.
  const handleBioStatusToggle = () => toggle('selectedBioStatus');
  const handleTrophyToggleChange = () => toggle('selectedTrophies');
  const handleOverHoursToggleChange = () => toggle('selectedOverTime');

  const textColorClass = darkMode ? `${styles.filterLabel} text-light` : styles.filterLabel;

  // The whole filter row is permission-gated, and the Bio Status item lives inside
  // it with its tooltip and controlled `checked`. An earlier shape declared a
  // second, uncontrolled Bio Status block above this gate; keeping both would have
  // rendered Bio Status twice, so only this one remains.
  return (
    <>
      {(hasPermissionToFilter || hasPermission?.(permissions.highlightEligibleBios)) && (
        <div className={styles.filterRow}>
          <div className={styles.specialColorsRow}>
            <span className={styles.filterGroupLabel}>Filter by:</span>

            <div className={styles.specialColorsItem}>
              <span className={textColorClass} data-tip data-for={`${formId}-bioFilterTooltip`}>
                Bio Status
              </span>
              <div style={{ marginTop: '10px' }}>
                <SlideToggle
                  color="default"
                  checked={Boolean(state?.selectedBioStatus)}
                  onChange={handleBioStatusToggle}
                />
              </div>
              <ReactTooltip id={`${formId}-bioFilterTooltip`} place="top" effect="solid">
                <span style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}>
                  Show users eligible for bio posting (tangible hours &gt; {BIO_MIN_TANGIBLE_HOURS},
                  days in team &gt; {BIO_MIN_DAYS_IN_TEAM}, bio not yet posted)
                </span>
              </ReactTooltip>
            </div>

            {hasPermissionToFilter && (
              <>
                <div className={styles.specialColorsItem}>
                  <span className={textColorClass}>Trophies</span>
                  <div style={{ marginTop: '10px' }}>
                    <SlideToggle
                      color="default"
                      checked={Boolean(state?.selectedTrophies)}
                      onChange={handleTrophyToggleChange}
                    />
                  </div>
                </div>

                <div className={styles.specialColorsItem}>
                  <span className={textColorClass} data-tip data-for={`${formId}-filterTooltip`}>
                    Over Hours
                  </span>
                  <div style={{ marginTop: '10px' }}>
                    <SlideToggle
                      color="default"
                      checked={Boolean(state?.selectedOverTime)}
                      onChange={handleOverHoursToggleChange}
                    />
                  </div>
                  <ReactTooltip id={`${formId}-filterTooltip`} place="top" effect="solid">
                    <span
                      style={{ whiteSpace: 'normal', wordWrap: 'break-word', maxWidth: '200px' }}
                    >
                      Filter people who contributed more than 25% of their committed hours
                    </span>
                  </ReactTooltip>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

WeeklySummariesToggleFilter.propTypes = {
  state: PropTypes.object.isRequired,
  setState: PropTypes.func,
  hasPermissionToFilter: PropTypes.bool,
  editable: PropTypes.bool,
  formId: PropTypes.string.isRequired,
  hasPermission: PropTypes.func,
  darkMode: PropTypes.bool,
};
