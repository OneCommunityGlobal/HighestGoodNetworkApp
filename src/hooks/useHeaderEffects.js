import { useEffect } from 'react';
import { fetchTaskEditSuggestions } from '~/components/TaskEditSuggestions/thunks';

/**
 * Custom hook to manage shared header useEffect logic.
 * Eliminates code duplication across Header.jsx, CPHeader.jsx, KIHeader.jsx, BMHeader.jsx
 * 
 * @param {Object} params - Hook parameters
 * @param {Object} params.auth - Redux auth state
 * @param {Object} params.role - Redux role state
 * @param {Object} params.collapseRef - Ref to collapse element
 * @param {Object} params.toggleRef - Ref to toggle button
 * @param {boolean} params.isOpen - Current open state
 * @param {Function} params.setIsOpen - Setter for isOpen
 * @param {Object} params.stateSetters - Object with setFirstName, setProfilePic, setDisplayUserId, setIsAuthUser
 * @param {Function} params.getHeaderData - Redux action to fetch header data
 * @param {Function} params.getAllRoles - Redux action to fetch all roles
 * @param {Function} params.dispatch - Redux dispatch function
 * @param {boolean} params.includeTaskEditSuggestions - Whether to fetch task edit suggestions (default: true)
 */
export const useHeaderEffects = ({
  auth,
  role,
  collapseRef,
  toggleRef,
  isOpen,
  setIsOpen,
  stateSetters,
  getHeaderData,
  getAllRoles,
  dispatch,
  includeTaskEditSuggestions = true,
}) => {
  const { setFirstName, setProfilePic, setDisplayUserId, setIsAuthUser } = stateSetters;
  const { isAuthenticated, user } = auth;
  const roles = role?.roles;

  // Handle storage event for viewingUser changes (cross-tab communication)
  useEffect(() => {
    const handleStorageEvent = () => {
      const sessionStorageData = JSON.parse(window.sessionStorage.getItem('viewingUser'));
      if (sessionStorageData) {
        setDisplayUserId(sessionStorageData.userId);
        setFirstName(sessionStorageData.firstName);
        setProfilePic(sessionStorageData.profilePic);
        setIsAuthUser(false);
      } else {
        setDisplayUserId(user.userid);
        setFirstName(auth.firstName);
        setProfilePic(auth.profilePic);
        setIsAuthUser(true);
      }
    };

    // Set the initial state when the component mounts
    handleStorageEvent();

    // Add the event listener
    window.addEventListener('storage', handleStorageEvent);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [user.userid, auth.firstName, setDisplayUserId, setFirstName, setProfilePic, setIsAuthUser, auth]);

  // Fetch header data and task edit suggestions
  useEffect(() => {
    if (isAuthenticated) {
      getHeaderData(user.userid);
      if (includeTaskEditSuggestions &&
        (auth.user.role === 'Administrator' || auth.user.role === 'Owner')) {
        dispatch(fetchTaskEditSuggestions());
      }
    }
  }, [isAuthenticated, includeTaskEditSuggestions, user.userid, auth.user.role, getHeaderData, dispatch]);

  // Fetch all roles on component mount
  useEffect(() => {
    if (roles && roles.length === 0) {
      getAllRoles();
    }
  }, [roles, getAllRoles]);

  // Handle click outside to close collapse menu
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        collapseRef.current &&
        !collapseRef.current.contains(event.target) &&
        !toggleRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);
};
