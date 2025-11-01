import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { ENDPOINTS } from '~/utils/URL';
import { startForceLogout } from '../../actions/authActions';
import { useCountdown } from '../../hooks/useCountdown';
import PopUpBar from '../PopUpBar/PopUpBar';
import { getUserProfile } from '../../actions/userProfile';

function PermissionWatcher() {
  const dispatch = useDispatch();
  const { isAuthenticated, forceLogoutAt } = useSelector(state => state.auth || {});
  const userProfile = useSelector(state => state.userProfile);
  const isAcknowledged = userProfile?.permissions?.isAcknowledged !== false;
  const [isAckLoading, setIsAckLoading] = useState(false);
  // Track previous authentication state to detect fresh logins
  const prevIsAuthenticatedRef = useRef(false);
  // Track previous acknowledgment state to detect when permissions change while logged in
  const prevIsAcknowledgedRef = useRef(null);
  // Track if this is the first effect run
  const isFirstRunRef = useRef(true);
  // Track if user was force logged out (using sessionStorage to persist across remounts)
  // Check sessionStorage on component initialization
  const checkWasForceLoggedOut = () => {
    const wasForceLoggedOut = sessionStorage.getItem('wasForceLoggedOut') === 'true';
    if (wasForceLoggedOut) {
      // Clear the flag after reading
      sessionStorage.removeItem('wasForceLoggedOut');
    }
    return wasForceLoggedOut;
  };
  const wasForceLoggedOutRef = useRef(checkWasForceLoggedOut());
  const wasForceLoggedOut = wasForceLoggedOutRef.current;
  // Get seconds remaining until force logout
  const secondsRemaining = useCountdown(forceLogoutAt);

  // Start the force logout countdown when conditions are met
  useEffect(() => {
    const wasPreviouslyAuthenticated = prevIsAuthenticatedRef.current;
    const wasPreviouslyAcknowledged = prevIsAcknowledgedRef.current;
    const isFirstRun = isFirstRunRef.current;
    const justLoggedIn = !wasPreviouslyAuthenticated && isAuthenticated;
    // Detect if permissions changed while user was logged in
    // (user was authenticated AND acknowledged before, now unacknowledged)
    const permissionsChangedWhileLoggedIn = wasPreviouslyAuthenticated && wasPreviouslyAcknowledged && !isAcknowledged;

    // On first run, initialize refs to current state
    if (isFirstRun) {
      isFirstRunRef.current = false;
      prevIsAuthenticatedRef.current = isAuthenticated;
      prevIsAcknowledgedRef.current = isAcknowledged;
      
      // On first mount, determine if this is:
      // 1. First login after permission change (was logged out when permissions changed)
      // 2. Logging back in after force logout (was logged in, force logged out, now logging back in)
      // Both scenarios should show notification only (no timer) to prevent logout loop
      if (isAuthenticated && !isAcknowledged && !forceLogoutAt) {
        if (wasForceLoggedOut) {
          // User was force logged out - they've already been through the timer once
          // Just show notification (no new timer)
        } else {
          // First login after permission change - show notification only (no timer)
        }
      }
      return;
    }

    // Update refs for next render
    prevIsAuthenticatedRef.current = isAuthenticated;
    prevIsAcknowledgedRef.current = isAcknowledged;

    // Only start force logout timer if:
    // 1. User is authenticated AND
    // 2. Permissions are not acknowledged AND
    // 3. No force logout is already in progress AND
    // 4. Permissions changed while user was logged in (detected by transition from acknowledged to unacknowledged)
    if (isAuthenticated && !isAcknowledged && !forceLogoutAt && permissionsChangedWhileLoggedIn) {
      // User was logged in when permissions changed - start force logout timer
      dispatch(startForceLogout(20000)); // 20 seconds countdown
    } else if (justLoggedIn && !isAcknowledged && !forceLogoutAt) {
      // User just logged in after permissions changed while logged out
      // Show notification only (no force logout timer)
      // Header component will handle showing the notification
    }
  }, [isAuthenticated, isAcknowledged, forceLogoutAt, dispatch]);
  // Handle acknowledgment of permission changes
  const handleAcknowledge = async () => {
    try {
      setIsAckLoading(true);

      if (!userProfile || !userProfile._id) {
        // eslint-disable-next-line no-console
        console.error('User profile not available');
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
          dispatch(getUserProfile(_id));
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error('Error updating user profile:', error);
          setIsAckLoading(false);
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error acknowledging permission changes:', error);
      setIsAckLoading(false);
    }
  };

  // Only render the popup when a force logout is in progress
  if (!forceLogoutAt) {
    return null;
  }
  return (
    !isAcknowledged && (
      <PopUpBar
        message={`Permissions changed—logging out in ${secondsRemaining}s. Timer will be stopped; please restart after login.`}
        onClickClose={handleAcknowledge}
        textColor="red"
        isLoading={isAckLoading}
        button={false}
      />
    )
  );
}

export default PermissionWatcher;
