import { useState, useRef, useMemo } from 'react';

/**
 * Custom hook to manage shared header component state and permissions.
 * Eliminates code duplication across Header.jsx, CPHeader.jsx, KIHeader.jsx, BMHeader.jsx
 * 
 * @param {Object} auth - Redux auth state
 * @returns {Object} Header state, refs, and permission constants
 */
export const useHeaderState = (auth) => {
  const { isAuthenticated, user, firstName: authFirstName, profilePic: authProfilePic } = auth;
  const [isOpen, setIsOpen] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [firstName, setFirstName] = useState(authFirstName);
  const [profilePic, setProfilePic] = useState(authProfilePic);
  const [isAuthUser, setIsAuthUser] = useState(true);
  const [displayUserId, setDisplayUserId] = useState(user.userid);
  const collapseRef = useRef(null);
  const toggleRef = useRef(null);

  const ALLOWED_ROLES_TO_INTERACT = useMemo(() => ['Owner', 'Administrator'], []);
  const canInteractWithViewingUser = useMemo(
    () => ALLOWED_ROLES_TO_INTERACT.includes(auth.user.role),
    [ALLOWED_ROLES_TO_INTERACT, auth.user.role],
  );

  const openModal = () => {
    setLogoutPopup(true);
  };

  const toggle = () => {
    setIsOpen(prevIsOpen => !prevIsOpen);
  };

  return {
    // State
    isOpen,
    setIsOpen,
    logoutPopup,
    setLogoutPopup,
    firstName,
    setFirstName,
    profilePic,
    setProfilePic,
    isAuthUser,
    setIsAuthUser,
    displayUserId,
    setDisplayUserId,
    // Refs
    collapseRef,
    toggleRef,
    // Constants
    ALLOWED_ROLES_TO_INTERACT,
    canInteractWithViewingUser,
    // Handlers
    openModal,
    toggle,
  };
};
