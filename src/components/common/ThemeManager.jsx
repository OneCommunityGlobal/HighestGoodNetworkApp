import { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * ThemeManager component handles global dark mode theme application
 * by managing CSS classes on the document body element
 */
const ThemeManager = () => {
  const darkMode = useSelector(state => state.theme?.darkMode || false);

  useEffect(() => {
    // Drive the page background directly from the redux theme so it can never
    // disagree with the component-level theme (inline !important beats any
    // lingering `.dark-mode` stylesheet rule).
    const pageBg = darkMode ? '#1a1d23' : '#ffffff';
    document.documentElement.style.setProperty('background-color', pageBg, 'important');
    document.body.style.setProperty('background-color', pageBg, 'important');
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.style.setProperty('background-color', pageBg, 'important');

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
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');
      const rootEl = document.getElementById('root');
      if (rootEl) rootEl.style.removeProperty('background-color');
    };
  }, [darkMode]);

  // This component doesn't render anything visible
  return null;
};

export default ThemeManager;
