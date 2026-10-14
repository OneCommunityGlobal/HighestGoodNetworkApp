import { createContext, useContext, useEffect, useState, useMemo } from 'react';

const ThemeContext = createContext({ darkMode: false, setDarkMode: () => {} });

export function ThemeProvider({ children }) {
  const getIsDarkMode = () => {
    if (typeof window !== 'undefined') {
      const darkMode = window.localStorage.getItem('darkMode');
      if (darkMode === 'true') return true;
      const persistRoot = window.localStorage.getItem('persist:root');
      if (persistRoot) {
        try {
          const parsed = JSON.parse(persistRoot);
          if (parsed.theme) {
            const themeObj = JSON.parse(parsed.theme);
            if (themeObj.darkMode === true || themeObj.darkMode === 'true') return true;
          }
        } catch (e) {
          /* ignore JSON parse errors */
        }
      }
    }
    return false;
  };

  const [darkMode, setDarkModeState] = useState(getIsDarkMode());

  useEffect(() => {
    function handleStorageChange(e) {
      if (e.key === 'darkMode' || e.key === 'persist:root' || e.key === null) {
        setDarkModeState(getIsDarkMode());
      }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    let last = getIsDarkMode();
    const interval = setInterval(() => {
      const current = getIsDarkMode();
      if (current !== last) {
        last = current;
        setDarkModeState(current);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const setDarkMode = value => {
    setDarkModeState(value);
    window.localStorage.setItem('darkMode', value ? 'true' : 'false');
  };

  const contextValue = useMemo(() => ({ darkMode, setDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
