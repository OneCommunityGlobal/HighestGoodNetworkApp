import { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import permissionLabels from 'components/PermissionsManagement/PermissionsConst';
import { updateUserProfileProperty } from '../../actions/userProfile';
import hasPermission from '../../utils/permissions';

export const PermissionsContext = createContext();

export function PermissionsProvider({ children, userProfile }) {
  const [currentUserPermissions, setCurrentUserPermissions] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (userProfile) {
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
        console.log('Traversing getCurrentUserPermissions permissions:', perms);
        for (let perm of perms) {
          if (perm.key) {
            console.log(
              `Dispatching hasPermission for ${perm.key} with viewingUser: true and userRole: ${userProfile.role}`,
            );
            const hasPerm = await dispatch(hasPermission(perm.key, false, userProfile.role));
            console.log(`Checking permission: ${perm.key}, hasPermission: ${hasPerm}`);
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

      await dispatch(
        updateUserProfileProperty(userProfile, 'permissions.frontPermissions', updatedPermissions),
      );

      return updatedPermissions;
    },
    [dispatch, userProfile, permissionLabelPermissions],
  );

  const handlePermissionsChange = updatedPermissions => {
    console.log('handlePermissionsChange called with:', updatedPermissions);
    // const newPermissions = await getCurrentUserPermissions(permissionLabels);
    // console.log('New permissions:', newPermissions);
    // setCurrentUserPermissions(newPermissions);
    setCurrentUserPermissions(updatedPermissions);
  };

  useEffect(() => {
    if (userProfile) {
      handlePermissionsChange(permissionLabels);
    }
  }, [userProfile]);

  return (
    <PermissionsContext.Provider
      value={{ currentUserPermissions, setCurrentUserPermissions, handlePermissionsChange }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}
