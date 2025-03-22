import { useState } from 'react';
import './WeeklyProjectSummary.css';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import ToolStatusDonutChart from './ToolStatusDonutChart';

export default function WeeklyProjectSummary() {
  const [openSections, setOpenSections] = useState({});

  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleSection = category => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const sections = [
    {
      title: 'Project Status',
      key: 'Project Status',
      className: 'full',
      content: (
        <div className="project-status-grid">
          {Array.from({ length: 12 }).map(() => {
            const uniqueId = uuidv4();
            return (
              <div key={uniqueId} className="weekly-project-summary-card small-card">
                📊 Card
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: 'Material Consumption',
      key: 'Material Consumption',
      className: 'large',
      content: [1, 2, 3].map(() => {
        const uniqueId = uuidv4();
        return (
          <div key={uniqueId} className="weekly-project-summary-card normal-card">
            📊 Card
          </div>
        );
      }),
    },
    {
      title: 'Issue Tracking',
      key: 'Issue Tracking',
      className: 'small',
      content: <div className="weekly-project-summary-card normal-card">📊 Card</div>,
    },
    {
      title: 'Tools and Equipment Tracking',
      key: 'Tools and Equipment Tracking',
      className: 'half',
      content: (
        <div className="weekly-project-summary-card normal-card tools-tracking-layout">
          <div className="tools-donut-wrap">
            <ToolStatusDonutChart />
          </div>
          <div className="tools-card-wrap">
            📊 Card
          </div>
        </div>
      ),
    },
    {
      title: 'Lessons Learned',
      key: 'Lessons Learned',
      className: 'half',
      content: [1, 2].map(() => {
        const uniqueId = uuidv4();
        return (
          <div key={uniqueId} className="weekly-project-summary-card normal-card">
            📊 Card
          </div>
        );
      }),
    },
    {
      title: 'Financials',
      key: 'Financials',
      className: 'large',
      content: (
        <>
          {Array.from({ length: 4 }).map(() => {
            const uniqueId = uuidv4();
            return (
              <div key={uniqueId} className="weekly-project-summary-card financial-small">
                📊 Card
              </div>
            );
          })}

          <div className="weekly-project-summary-card financial-big">📊 Big Card</div>
        </>
      ),
    },
    {
      title: 'Loss Tracking',
      key: 'Loss Tracking',
      className: 'small',
      content: <div className="weekly-project-summary-card normal-card">📊 Card</div>,
    },
    {
      title: 'Global Distribution and Project Status',
      key: 'Global Distribution and Project Status',
      className: 'half',
      content: (
        <>
          <div className="weekly-project-summary-card wide-card">📊 Wide Card</div>
          <div className="weekly-project-summary-card normal-card">📊 Normal Card</div>
        </>
      ),
    },
    {
      title: 'Labor and Time Tracking',
      key: 'Labor and Time Tracking',
      className: 'half',
      content: [1, 2].map(() => {
        const uniqueId = uuidv4();
        return (
          <div key={uniqueId} className="weekly-project-summary-card normal-card">
            📊 Card
          </div>
        );
      }),
    },
  ];

  return (
    <div className={`weekly-project-summary-container ${darkMode ? 'dark-mode' : ''}`}>
      <WeeklyProjectSummaryHeader />
      <div className="weekly-project-summary-dashboard-container">
        <div className="weekly-project-summary-dashboard-grid">
          {sections.map(({ title, key, className, content }) => (
            <div key={key} className={`weekly-project-summary-dashboard-section ${className}`}>
              <div
                className="weekly-project-summary-dashboard-category-title"
                onClick={() => toggleSection(key)}
              >
                {title}{' '}
                <span className="weekly-project-summary-dropdown-icon">
                  {openSections[key] ? '∧' : '∨'}
                </span>
              </div>
              {openSections[key] && (
                <div className="weekly-project-summary-dashboard-category-content">{content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
