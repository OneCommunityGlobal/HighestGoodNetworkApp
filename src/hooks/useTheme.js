import { useEffect } from 'react';
import { useSelector } from 'react-redux';

function useTheme() {
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.add('bm-dashboard-dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
    }

    // Cleanup function
    return () => {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
    };
  }, [darkMode]);
}

export default useTheme;
