import { createContext, useState } from 'react';

export const PermissionsContext = createContext();

export function PermissionsProvider({ children }) {
  const [currentUserPermissions, setCurrentUserPermissions] = useState([]);

  const handlePermissionsChange = updatedPermissions => {
    console.log('handlePermissionsChange called with:', updatedPermissions);
    setCurrentUserPermissions(updatedPermissions);
  };

  return (
    <PermissionsContext.Provider
      value={{ currentUserPermissions, setCurrentUserPermissions, handlePermissionsChange }}
    >
      {children}
    </PermissionsContext.Provider>
  );
}
