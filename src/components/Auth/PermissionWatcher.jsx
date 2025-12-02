import { useEffect, useState } from 'react';
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
  const [isPermAckLoading, setIsPermAckLoading] = useState(false);
  // Get seconds remaining until force logout
  const secondsRemaining = useCountdown(forceLogoutAt);

  // Start the force logout countdown when conditions are met
  useEffect(() => {
    if (isAuthenticated && !isAcknowledged && !forceLogoutAt) {
      // eslint-disable-next-line no-console
      console.log('Starting force logout countdown due to unacknowledged permission changes');
      dispatch(startForceLogout(20000)); // 20 seconds countdown
    }
  }, [isAuthenticated, isAcknowledged, forceLogoutAt, dispatch]);
  // Handle acknowledgment of permission changes
  const handleAcknowledge = async () => {
    try {
      setIsPermAckLoading(true);

      if (!userProfile || !userProfile._id) {
        // eslint-disable-next-line no-console
        //console.error('User profile not available');
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
          setIsPermAckLoading(false);
          dispatch(getUserProfile(_id));
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          // console.error('Error updating user profile:', error);
          setIsPermAckLoading(false);
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      // console.error('Error acknowledging permission changes:', error);
      setIsPermAckLoading(false);
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
        isLoading={isPermAckLoading}
        button={false}
      />
    )
  );
}

export default PermissionWatcher;
