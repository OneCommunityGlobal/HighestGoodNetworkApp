import { useSelector } from 'react-redux';
import AppUpdateNotice from '~/components/AppUpdateNotice/AppUpdateNotice';

/**
 * Shows the "refresh your app" notice after a new deploy.
 *
 * This used to poll /hash.txt, but that file is a static placeholder
 * that never changes between builds, so the notice could never appear.
 * It now uses the build ID check in AppUpdateNotice. The component name
 * and its places in routes.jsx are kept so every page that showed the
 * old notice shows the new one.
 */
function AutoUpdate() {
  const darkMode = useSelector(state => state.theme?.darkMode);
  return <AppUpdateNotice darkMode={Boolean(darkMode)} />;
}

export default AutoUpdate;
