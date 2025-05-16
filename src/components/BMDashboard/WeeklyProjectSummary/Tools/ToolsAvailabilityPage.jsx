import React from 'react';
import { useSelector } from 'react-redux';
import ToolsHorizontalBarChart from './ToolsHorizontalBarChart';
import './ToolsAvailabilityPage.css';

function ToolsAvailabilityPage() {
  const darkMode = useSelector(state => state.theme.darkMode);

  return (
    <div className={`tools-availability-page ${darkMode ? 'dark-mode' : ''}`}>
      <div className="tools-availability-content">
        <ToolsHorizontalBarChart darkMode={darkMode} isFullPage={true} />
      </div>
    </div>
  );
}

export default ToolsAvailabilityPage;
