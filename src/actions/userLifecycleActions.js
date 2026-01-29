import moment from 'moment';
import { toast } from 'react-toastify';
import { updateUserLifecycle, buildUpdatedUserLifecycleDetails } from './userManagement';
import { UserStatusOperations } from '../utils/enums';

export const scheduleDeactivationAction = async (
  dispatch,
  userProfile,
  endDate,
  loadUserProfile
) => {
  const action = UserStatusOperations.SCHEDULE_DEACTIVATION;
  const updatedUser = buildUpdatedUserLifecycleDetails(userProfile, {
    action,
    endDate,
  });

  try {
    await dispatch(
      updateUserLifecycle(updatedUser, {
        action,
        endDate,
        originalUser: userProfile,
      })
    );

    toast.success('User deactivation scheduled.');
    if (loadUserProfile) await loadUserProfile();
  } catch (err) {
    toast.error('Failed to schedule deactivation.');
    throw err;
  }
};

export const activateUserAction = async (
  dispatch,
  userProfile,
  loadUserProfile
) => {
  console.trace('LIFECYCLE ACTION CALLED');
  const action = UserStatusOperations.ACTIVATE;
  const updatedUser = buildUpdatedUserLifecycleDetails(userProfile, { action });

  try {
    await dispatch(
      updateUserLifecycle(updatedUser, {
        action,
        originalUser: userProfile,
      })
    );

    toast.success('User activated.');
    if (loadUserProfile) await loadUserProfile();
  } catch (err) {
    toast.error('Failed to activate user.');
    throw err;
  }
};

export const deactivateImmediatelyAction = async (
  dispatch,
  userProfile,
  loadUserProfile
) => {
  console.trace('LIFECYCLE ACTION CALLED');
  console.log('User profile for deactivation:', userProfile);
  const action = UserStatusOperations.DEACTIVATE;
  const updatedUser = buildUpdatedUserLifecycleDetails(userProfile, { action });
  console.log('Deactivating user with details:', updatedUser);
  try {
    if(!userProfile.endDate){
      //usually required when called from UserManagement table
      console.log('Setting endDate to now for immediate deactivation');
      userProfile.endDate = moment().toISOString();
    }
    await dispatch(
      updateUserLifecycle(updatedUser, {
        action,
        originalUser: userProfile,
      })
    );

    toast.success('User deactivated successfully.');
    if (loadUserProfile) await loadUserProfile();
  } catch (err) {
    toast.error('Failed to deactivate user.');
    throw err;
  }
};

export const pauseUserAction = async (
  dispatch,
  userProfile,
  reactivationDate,
  loadUserProfile
) => {
  const action = UserStatusOperations.PAUSE;
  const updatedUser = buildUpdatedUserLifecycleDetails(userProfile, {
    action,
    reactivationDate,
  });

  try {
    await dispatch(
      updateUserLifecycle(updatedUser, {
        action,
        reactivationDate,
        originalUser: userProfile,
      })
    );

    toast.success('User paused successfully.');
    if (loadUserProfile) await loadUserProfile();
  } catch (err) {
    toast.error('Failed to pause user.');
    throw err;
  }
};
