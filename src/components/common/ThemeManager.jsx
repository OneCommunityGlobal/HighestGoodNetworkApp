import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * ThemeManager component handles global dark mode theme application
 * by managing CSS classes on the document body element
 */
const ThemeManager = () => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  useEffect(() => {
    // Apply dark mode class to body for global styling
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.add('bm-dashboard-dark');
      // Also apply to the root element for complete coverage
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
      document.documentElement.classList.remove('dark-mode');
    }

    // Cleanup function to remove classes when component unmounts
    return () => {
      document.body.classList.remove('dark-mode');
      document.body.classList.remove('bm-dashboard-dark');
      document.documentElement.classList.remove('dark-mode');
    };
  }, [darkMode]);

  // This component doesn't render anything visible
  return null;
};

export default ThemeManager;
