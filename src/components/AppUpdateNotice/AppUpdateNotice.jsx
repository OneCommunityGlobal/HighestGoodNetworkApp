import { useState } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import useAppUpdateCheck from '~/hooks/useAppUpdateCheck';
import styles from './AppUpdateNotice.module.css';

export const DISMISSED_BUILD_KEY = 'hgnDismissedUpdateBuildId';

const INFO_ICON_ID = 'appUpdateNoticeInfoIcon';

const readDismissedBuildId = () => {
  try {
    return window.localStorage.getItem(DISMISSED_BUILD_KEY);
  } catch {
    return null;
  }
};

const saveDismissedBuildId = buildId => {
  try {
    window.localStorage.setItem(DISMISSED_BUILD_KEY, buildId);
  } catch {
    // Storage can be unavailable (private mode); dismissing still works for this page.
  }
};

/**
 * Asks people to refresh when a newer version of the app has been
 * deployed. Dismissing hides it until the next deploy.
 */
function AppUpdateNotice({ darkMode = false }) {
  const { updateAvailable, latestBuildId } = useAppUpdateCheck();
  const [dismissedBuildId, setDismissedBuildId] = useState(readDismissedBuildId);

  if (!updateAvailable || dismissedBuildId === latestBuildId) return null;

  const dismiss = () => {
    saveDismissedBuildId(latestBuildId);
    setDismissedBuildId(latestBuildId);
  };

  return (
    <div
      className={`${styles.appUpdateNotice} ${darkMode ? styles.appUpdateNoticeDark : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.appUpdateNoticeText}>
        <p className={styles.appUpdateNoticeMessage}>
          A recent update has been merged from Dev to Main. To ensure you’re working with the latest
          changes, please refresh your app.{' '}
          <button
            type="button"
            id={INFO_ICON_ID}
            className={styles.appUpdateNoticeInfoButton}
            aria-label="How to refresh the app"
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </button>
        </p>
        <p className={styles.appUpdateNoticeMessage}>
          Thank you for keeping your workspace up to date!
        </p>
      </div>
      <UncontrolledTooltip placement="bottom" target={INFO_ICON_ID} trigger="hover focus">
        The easy way to refresh the app is Command (Mac)/Control (PC) + Shift + R. If that doesn’t
        work, try also emptying your cache for that page. To do this, right click anywhere on the
        app screen when it is open, choose “Inspect”, then right click on the little refresh icon at
        the top and to the left of the URL and choose “Empty Cache and Hard Reload” from the
        dropdown.
      </UncontrolledTooltip>
      <button
        type="button"
        className={styles.appUpdateNoticeClose}
        onClick={dismiss}
        aria-label="Dismiss update notice"
      >
        ×
      </button>
    </div>
  );
}

AppUpdateNotice.propTypes = {
  darkMode: PropTypes.bool,
};

export default AppUpdateNotice;
