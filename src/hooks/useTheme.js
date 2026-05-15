import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function useTheme() {
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    const body = document.body;

    if (darkMode) {
      body.classList.add('dark-mode');
      body.classList.add('bm-dashboard-dark');
    } else {
      body.classList.remove('dark-mode');
      body.classList.remove('bm-dashboard-dark');
    }

    // Cleanup function
    return () => {
      body.classList.remove('dark-mode');
      body.classList.remove('bm-dashboard-dark');
    };
  }, [darkMode]);

  return darkMode;
}

export default useTheme;
