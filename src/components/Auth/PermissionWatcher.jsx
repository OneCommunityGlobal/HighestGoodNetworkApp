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
  const secondsRemaining = useCountdown(forceLogoutAt);
  const [wasForceLoggedOut, setWasForceLoggedOut] = useState(false);
  const [flagReady, setFlagReady] = useState(false);
  const [initialAcknowledgedState, setInitialAcknowledgedState] = useState(null);
  const [isInitialLogin, setIsInitialLogin] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const flag = sessionStorage.getItem('wasForceLoggedOut');
        setWasForceLoggedOut(flag === 'true');
        sessionStorage.removeItem('wasForceLoggedOut');
      } catch {}
      setIsInitialLogin(true);
      setInitialAcknowledgedState(null);
    } else {
      setIsInitialLogin(false);
      setInitialAcknowledgedState(null);
      setWasForceLoggedOut(false);
    }
    setFlagReady(true);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !flagReady) return;
    if (!userProfile) return;
    if (!isInitialLogin) return;

    if (initialAcknowledgedState === null) {
      const safestate = isAcknowledged === undefined ? true : isAcknowledged;
      setInitialAcknowledgedState(safestate);
      return;
    }

    const loggedInWithUnacknowledgedPermissions =
      isAcknowledged === false && !forceLogoutAt && !wasForceLoggedOut;

    if (loggedInWithUnacknowledgedPermissions) {
      setIsInitialLogin(false);
      return;
    }

    const loggedInAfterForceLogout =
      isAcknowledged === false && !forceLogoutAt && wasForceLoggedOut;

    if (loggedInAfterForceLogout) {
      setIsInitialLogin(false);
      return;
    }

    if (isAcknowledged !== false) {
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

  useEffect(() => {
    if (!isAuthenticated || !flagReady) return;
    if (!userProfile) return;
    if (isInitialLogin) return;

    const permissionsChangedMidSession =
      isAcknowledged === false && !forceLogoutAt && initialAcknowledgedState !== false;

    if (permissionsChangedMidSession) {
      dispatch(startForceLogout(20000));
      return;
    }

    if (isAcknowledged === true && forceLogoutAt) {
      dispatch(stopForceLogout());
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
          setInitialAcknowledgedState(true);
          setIsInitialLogin(false);
          dispatch(getUserProfile(_id));
        })
        .catch(error => {
          setIsAckLoading(false);
        });
    } catch (error) {
      setIsAckLoading(false);
    }
  };

  if (forceLogoutAt && isAcknowledged === false) {
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
