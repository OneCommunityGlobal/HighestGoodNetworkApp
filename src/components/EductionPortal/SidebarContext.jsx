import React, { createContext, useEffect, useMemo, useState } from 'react';

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isMinimized, setIsMinimized] = useState(() => {
    try {
      return localStorage.getItem('ep.sidebar.minimized') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ep.sidebar.minimized', isMinimized ? 'true' : 'false');
    } catch (e) {
      // ignore
    }
  }, [isMinimized]);

  const value = useMemo(() => ({ isMinimized, setIsMinimized }), [isMinimized]);

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
