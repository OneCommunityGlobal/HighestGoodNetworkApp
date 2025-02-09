import { createContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import permissionLabels from 'components/PermissionsManagement/PermissionsConst';
import { updateUserProfileProperty } from '../../actions/userProfile';
import hasPermission from '../../utils/permissions';

export const PermissionsContext = createContext();

export function PermissionsProvider({ children, userProfile }) {
  const [currentUserPermissions, setCurrentUserPermissions] = useState([]);
  const dispatch = useDispatch();
  const initialLoad = useRef(true); // Ref to track initial load

  useEffect(() => {
    if (userProfile && userProfile.role) {
      console.log('PermissionsProvider userProfile:', userProfile);
    } else {
      console.log('PermissionsProvider userProfile is undefined');
    }
  }, [userProfile]);

  // function to remove permissions that are not in the permissionLabels array
  const getValidPermissions = useCallback(permissions => {
    // console.log('getValidPermissions function invoked');
    const validPermissions = new Set();

    const traversePermissions = perms => {
      // console.log('Traversing permissions for getValidPermissions:', perms);
      for (let perm of perms) {
        if (perm.key) {
          validPermissions.add(perm.key);
        }
        if (perm.subperms) {
          traversePermissions(perm.subperms);
        }
      }
    };

    traversePermissions(permissions);
    return validPermissions;
  }, []);

  const permissionLabelPermissions = useMemo(() => getValidPermissions(permissionLabels), [
    getValidPermissions,
    permissionLabels,
  ]);

  const getCurrentUserPermissions = useCallback(
    async permissions => {
      console.log('getCurrentUserPermissions function invoked');
      const userPermissions = [];

      const traversePermissions = async perms => {
        // console.log('Traversing getCurrentUserPermissions permissions:', perms);
        for (let perm of perms) {
          if (perm.key) {
            if (!userProfile || !userProfile.role) {
              console.error('userProfile or userProfile.role is undefined');
              return []; // Early return if userProfile or userProfile.role is undefined
            }
            /* console.log(
              `Dispatching hasPermission for ${perm.key} with viewingUser: true and userRole: ${userProfile.role}`,
            ); */
            const hasPerm = await dispatch(hasPermission(perm.key, false, userProfile.role));
            // console.log(`Checking permission: ${perm.key}, hasPermission: ${hasPerm}`);
            if (
              hasPerm &&
              permissionLabelPermissions.has(perm.key) &&
              !userPermissions.includes(perm.key)
            ) {
              userPermissions.push(perm.key);
            }
          }
          if (perm.subperms) {
            await traversePermissions(perm.subperms);
          }
        }
      };

      await traversePermissions(permissions);

      // making sure all roles can update a role for testing purposes
      // Add 'putRole' and 'putUserProfile' to the permissions array if they are not already present
      const updatedPermissions = [...new Set([...userPermissions, 'putRole', 'putUserProfile'])];

      console.log('Updated permissions from getCurrentUserPermissions:', updatedPermissions);

      if (!userProfile || !userProfile._id) {
        console.error('userProfile or userProfile._id is undefined');
        return updatedPermissions; // Early return if userProfile or userProfile._id is undefined
      }

      await dispatch(
        updateUserProfileProperty(userProfile, 'permissions.frontPermissions', updatedPermissions),
      );

      return updatedPermissions;
    },
    [dispatch, userProfile, permissionLabelPermissions],
  );

  const handlePermissionsChange = useCallback(updatedPermissions => {
    console.log('handlePermissionsChange called with:', updatedPermissions);
    setCurrentUserPermissions(prevPermissions => {
      if (JSON.stringify(prevPermissions) !== JSON.stringify(updatedPermissions)) {
        console.log('Updating currentUserPermissions state');
        return updatedPermissions;
      }
      return prevPermissions;
    });
  }, []); // Ensure handlePermissionsChange is memoized and not recreated on every render

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
      console.log('Initial load, fetching permissions'); // Detailed logging
      if (userProfile && userProfile.role) {
        getCurrentUserPermissions(permissionLabels).then(handlePermissionsChange);
      }
    } else {
      console.log('Subsequent load, skipping permissions fetch'); // Detailed logging
    }
  }, [userProfile, getCurrentUserPermissions, handlePermissionsChange]);

  useEffect(() => {
    console.log('currentUserPermissions updated:', currentUserPermissions); // Log state updates
  }, [currentUserPermissions]);

  const contextValue = useMemo(
    () => ({
      currentUserPermissions,
      setCurrentUserPermissions,
      handlePermissionsChange,
      permissionLabelPermissions,
      getCurrentUserPermissions,
    }),
    [
      currentUserPermissions,
      setCurrentUserPermissions,
      handlePermissionsChange,
      permissionLabelPermissions,
      getCurrentUserPermissions,
    ],
  );

  return <PermissionsContext.Provider value={contextValue}>{children}</PermissionsContext.Provider>;
}
