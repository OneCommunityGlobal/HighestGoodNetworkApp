import { useEffect, useRef, useState } from 'react';
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
  const isAcknowledged = userProfile?.permissions?.isAcknowledged === true;
  const [isAckLoading, setIsAckLoading] = useState(false);
  // Get seconds remaining until force logout
  const secondsRemaining = useCountdown(forceLogoutAt);

  // Track previous acknowledgement state across this auth session
  const prevIsAcknowledgedRef = useRef(null);
  const isInitialStateRef = useRef(true);

  // Debug: Log when isAcknowledged changes
  useEffect(() => {
    console.log(
      'isAcknowledged changed to:',
      isAcknowledged,
      'isInitialState:',
      isInitialStateRef.current,
    );
    if (isAcknowledged === true && isInitialStateRef.current) {
      console.trace('Stack trace for isAcknowledged change to true');
      // If we're in initial state and isAcknowledged becomes true,
      // it means something else is overriding our state
      // We need to preserve the isAcknowledged: false state
      console.log('Overriding isAcknowledged back to false to preserve banner state');
      // We can't directly modify the Redux state here, so we'll handle this differently
    }
  }, [isAcknowledged]);

  // Start the force logout countdown only when acknowledgement flips from true -> false
  // during an active session. First login with unacknowledged permissions only shows banner.
  useEffect(() => {
    if (!isAuthenticated) {
      prevIsAcknowledgedRef.current = null;
      isInitialStateRef.current = true; // Reset initial state on logout
      return;
    }

    // Initialize on first authenticated render; do not trigger countdown on first load
    if (prevIsAcknowledgedRef.current === null) {
      // Set to the current value to detect transitions
      prevIsAcknowledgedRef.current = isAcknowledged;
      isInitialStateRef.current = true;
      console.log(
        'PermissionWatcher: Initial state - isAcknowledged:',
        isAcknowledged,
        'prevIsAcknowledgedRef set to:',
        isAcknowledged,
      );
      return;
    }

    const wasAcknowledged = prevIsAcknowledgedRef.current === true;
    const nowUnacknowledged = isAcknowledged === false;

    // Debug: Log the transition
    console.log(
      'PermissionWatcher Debug - wasAcknowledged:',
      wasAcknowledged,
      'nowUnacknowledged:',
      nowUnacknowledged,
      'forceLogoutAt:',
      forceLogoutAt,
      'isInitialState:',
      isInitialStateRef.current,
    );

    // Only start countdown if:
    // 1. We transition from acknowledged to unacknowledged
    // 2. We're NOT in initial state (meaning this is a change during active session)
    // 3. No force logout is already in progress
    if (wasAcknowledged && nowUnacknowledged && !isInitialStateRef.current && !forceLogoutAt) {
      console.log('Starting force logout countdown due to permission change during active session');
      dispatch(startForceLogout(20000)); // 20 seconds countdown
    }

    // Update the ref for next comparison
    prevIsAcknowledgedRef.current = isAcknowledged;

    // Mark that we're no longer in initial state after first update
    if (isInitialStateRef.current) {
      isInitialStateRef.current = false;
    }
  }, [isAuthenticated, isAcknowledged, forceLogoutAt, dispatch]);

  // Poll for permission changes every 10 seconds to detect changes made by other users
  // Start polling after a delay to allow initial page load to complete
  useEffect(() => {
    console.log(
      'PermissionWatcher useEffect - isAuthenticated:',
      isAuthenticated,
      'userProfile._id:',
      userProfile?._id,
    );
    if (!isAuthenticated || !userProfile?._id) {
      console.log('PermissionWatcher: Not starting polling - missing auth or userProfile._id');
      return;
    }

    let pollInterval;

    // Start polling after 10 seconds delay to avoid interfering with initial load
    const startDelay = setTimeout(() => {
      console.log('Starting permission polling...');
      pollInterval = setInterval(async () => {
        // Only poll if no force logout is in progress
        if (!forceLogoutAt) {
          console.log('Polling for permission changes...');
          try {
            const response = await axios.get(ENDPOINTS.USER_PROFILE(userProfile._id));
            const newIsAcknowledged = response.data?.permissions?.isAcknowledged === true;
            console.log(
              'Polling response - isAcknowledged:',
              newIsAcknowledged,
              'prevIsAcknowledgedRef:',
              prevIsAcknowledgedRef.current,
              'isInitialState:',
              isInitialStateRef.current,
            );

            // Check for transition from true to false during polling
            // Only trigger logout if we're NOT in initial state (meaning this is a change during active session)
            if (
              prevIsAcknowledgedRef.current === true &&
              newIsAcknowledged === false &&
              !isInitialStateRef.current
            ) {
              console.log('Permission change detected during polling - starting countdown');
              dispatch(startForceLogout(20000));
            }

            // Skip other polling logic if we're in initial state (first login with isAcknowledged: false)
            if (isInitialStateRef.current && isAcknowledged === false) {
              console.log(
                'Skipping other polling logic - in initial state with isAcknowledged: false',
              );
              return;
            }

            // Update the ref and fetch profile
            prevIsAcknowledgedRef.current = newIsAcknowledged;
            dispatch(getUserProfile(userProfile._id));

            // Mark that we're no longer in initial state
            isInitialStateRef.current = false;
          } catch (error) {
            console.error('Polling error:', error);
          }
        }
      }, 10000); // Poll every 10 seconds
    }, 10000);

    return () => {
      clearTimeout(startDelay);
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [isAuthenticated, userProfile?._id, forceLogoutAt, dispatch]);
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
