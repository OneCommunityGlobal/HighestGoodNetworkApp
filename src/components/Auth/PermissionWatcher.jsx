import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { startForceLogout, stopForceLogout } from '../../actions/authActions';
import { useCountdown } from '../../hooks/useCountdown';
import PopUpBar from '../PopUpBar/PopUpBar';
import { getUserProfile } from '../../actions/userProfile';

function PermissionWatcher() {
  const dispatch = useDispatch();
  const { isAuthenticated, forceLogoutAt } = useSelector(state => state.auth || {});
  const userProfile = useSelector(state => state.userProfile);
  const isAcknowledged = userProfile?.permissions?.isAcknowledged;
  const [isAckLoading, setIsAckLoading] = useState(false);
  // Get seconds remaining until force logout
  const secondsRemaining = useCountdown(forceLogoutAt);
  const [wasForceLoggedOut, setWasForceLoggedOut] = useState(false);
  const [flagReady, setFlagReady] = useState(false);
  // Track the initial acknowledged state when user first logs in
  const [initialAcknowledgedState, setInitialAcknowledgedState] = useState(null);
  // Track if user has just logged in (to distinguish from mid-session changes)
  const [isInitialLogin, setIsInitialLogin] = useState(false);

  // On mount or when authentication changes, read flag from sessionStorage
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const flag = sessionStorage.getItem('wasForceLoggedOut');
        setWasForceLoggedOut(flag === 'true');
        sessionStorage.removeItem('wasForceLoggedOut');
      } catch {
        // sessionStorage might not be available (private browsing, etc.)
        // Silently fail - component will work without the flag
      }

      // Mark as initial login (initial state will be captured when profile loads)
      setIsInitialLogin(true);
      setInitialAcknowledgedState(null); // Reset to wait for profile load
    } else {
      // User logged out, reset state
      setIsInitialLogin(false);
      setInitialAcknowledgedState(null);
      setWasForceLoggedOut(false);
    }

    setFlagReady(true);
  }, [isAuthenticated]);

  // Track when user profile is first loaded after login and handle initial login cases
  useEffect(() => {
    if (!isAuthenticated || !flagReady) return;
    if (userProfile === null || userProfile === undefined) return; // Wait for profile to load
    if (!isInitialLogin) return; // Only handle initial login cases

    // Capture the initial acknowledged state when profile is first loaded
    if (initialAcknowledgedState === null) {
      setInitialAcknowledgedState(isAcknowledged);
      return; // Wait for next render to check conditions
    }

    // Edge Case 2: User permissions changed when logged out → show banner only on login
    // Detected by: user just logged in with unacknowledged permissions
    // AND was NOT force logged out (just normal logout with permission changes)
    const loggedInWithUnacknowledgedPermissions =
      !isAcknowledged && !forceLogoutAt && !wasForceLoggedOut;

    if (loggedInWithUnacknowledgedPermissions) {
      setIsInitialLogin(false); // Mark as no longer initial login
      return;
    }

    // Edge Case 3: User was force logged out → permissions change → user logs back in → show banner only
    // Detected by: user just logged in with unacknowledged permissions AND was force logged out
    const loggedInAfterForceLogout = !isAcknowledged && !forceLogoutAt && wasForceLoggedOut;

    if (loggedInAfterForceLogout) {
      setIsInitialLogin(false); // Mark as no longer initial login
      return;
    }

    // If initial login and permissions are acknowledged, mark as no longer initial
    if (isAcknowledged) {
      setIsInitialLogin(false);
    }
  }, [
    isAuthenticated,
    flagReady,
    isAcknowledged,
    forceLogoutAt,
    wasForceLoggedOut,
    dispatch,
    isInitialLogin,
    initialAcknowledgedState,
    userProfile,
  ]);

  // Handle mid-session permission changes (Edge Case 1)
  useEffect(() => {
    if (!isAuthenticated || !flagReady) return;
    if (userProfile === null || userProfile === undefined) return; // Wait for profile to load
    if (isInitialLogin) return; // Skip mid-session checks during initial login

    // User permissions changed when logged in → start timer
    // Detected by: permissions were acknowledged (or was null/true), then became unacknowledged
    // AND user was already logged in (not initial login)
    const permissionsChangedMidSession =
      !isAcknowledged && !forceLogoutAt && initialAcknowledgedState !== false; // Was acknowledged or null before (not explicitly false)

    if (permissionsChangedMidSession) {
      dispatch(startForceLogout(20000));
      return;
    }

    // Case: permissions re-acknowledged → cancel timer
    if (isAcknowledged && forceLogoutAt) {
      dispatch(stopForceLogout());
      // Reset initial state since permissions are now acknowledged
      setInitialAcknowledgedState(true);
    }
  }, [
    isAuthenticated,
    flagReady,
    isAcknowledged,
    forceLogoutAt,
    dispatch,
    isInitialLogin,
    initialAcknowledgedState,
    userProfile,
  ]);

  // Handle acknowledgment of permission changes
  const handleAcknowledge = async () => {
    try {
      setIsAckLoading(true);

      if (!userProfile || !userProfile._id) {
        setIsAckLoading(false);
        return;
      }

      const { firstName: name, lastName, personalLinks, adminLinks, _id } = userProfile;

      axios
        .put(ENDPOINTS.USER_PROFILE(_id), {
          firstName: name,
          lastName,
          personalLinks,
          adminLinks,

          isAcknowledged: true,
        })
        .then(() => {
          setIsAckLoading(false);
          // Update initial state to reflect acknowledgment
          setInitialAcknowledgedState(true);
          setIsInitialLogin(false);
          dispatch(getUserProfile(_id));
        })
        .catch(() => {
          setIsAckLoading(false);
        });
    } catch {
      setIsAckLoading(false);
    }
  };

  // Force logout timer running (mid-session permission change)
  if (forceLogoutAt && !isAcknowledged) {
    return (
      <PopUpBar
        message={`Permissions changed—logging out in ${secondsRemaining}s unless acknowledged.`}
        onClickClose={handleAcknowledge}
        isLoading={isAckLoading}
        button
      />
    );
  }

  return null;
}

export default PermissionWatcher;
