import './WeeklyProjectSummary.css';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';

function FinancialCard({ title, value = '-', monthOverMonth = '-', additionalInfo = {} }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getColorScheme = percentage => {
    if (percentage === '-') return 'neutral';
    if (percentage > 0) return 'positive';
    if (percentage < 0) return 'negative';
    return 'neutral';
  };

  const colorScheme = getColorScheme(monthOverMonth);

  const titleClass = title.replace(/\s+/g, '-').toLowerCase();

  return (
    <div
      className={`financial-card ${colorScheme} custom-box-shadow financial-card-background-${titleClass}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="financial-card-title">{title}</div>
      <div className={`financial-card-ellipse financial-card-ellipse-${titleClass}`} />
      <div className="financial-card-value">{value === '-' ? '-' : value.toLocaleString()}</div>
      <div className={`financial-card-month-over-month ${colorScheme}`}>
        {monthOverMonth === '-'
          ? '-'
          : `${monthOverMonth > 0 ? '+' : ''}${monthOverMonth}% month over month`}
      </div>

      {/* Tooltip for Additional Info */}
      {showTooltip && Object.keys(additionalInfo).length > 0 && (
        <div className="financial-card-tooltip">
          {Object.entries(additionalInfo).map(([key]) => (
            <div key={key} className="financial-card-tooltip-item">
              <span className="tooltip-key">{key}:</span>
              <span className="tooltip-value">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyProjectSummary() {
  const [openSections, setOpenSections] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggleSection = category => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const createCards = (count, cardClassName = 'normal-card') => {
    return Array.from({ length: count }).map(() => {
      const uniqueId = uuidv4();
      return (
        <div key={uniqueId} className={`weekly-project-summary-card ${cardClassName}`}>
          📊 Card
        </div>
      );
    });
  };

  const financialData = [
    {
      id: uuidv4(),
      title: 'Total Project Cost',
      value: '-',
      monthOverMonth: '-',
      additionalInfo: {
        'Budget Utilization': '-',
        Forecast: '-',
      },
    },
    {
      id: uuidv4(),
      title: 'Total Material Cost',
      value: '-',
      monthOverMonth: '-',
      additionalInfo: {
        'Inventory Cost': '-',
        Suppliers: '-',
      },
    },
    {
      id: uuidv4(),
      title: 'Total Labor Cost',
      value: '-',
      monthOverMonth: '-',
      additionalInfo: {
        'Overtime Hours': '-',
        'Team Efficiency': '-',
      },
    },
    {
      id: uuidv4(),
      title: 'Total Equipment Cost',
      value: '-',
      monthOverMonth: '-',
      additionalInfo: {
        'Equipment Utilization': '-',
        'Maintenance Cost': '-',
      },
    },
  ];

  const sections = [
    {
      title: 'Project Status',
      key: 'Project Status',
      className: 'full',
      content: <div className="project-status-grid">{createCards(12, 'small-card')}</div>,
    },
    {
      title: 'Material Consumption',
      key: 'Material Consumption',
      className: 'large',
      content: createCards(3),
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
      content: createCards(2),
    },
    {
      title: 'Lessons Learned',
      key: 'Lessons Learned',
      className: 'half',
      content: createCards(2),
    },
    {
      title: 'Financials',
      key: 'Financials',
      className: 'large',
      content: (
        <div className="financial-cards-container">
          {financialData.map(card => (
            <FinancialCard
              key={card.id}
              title={card.title}
              value={card.value}
              monthOverMonth={card.monthOverMonth}
              additionalInfo={card.additionalInfo}
            />
          ))}
          <div className="weekly-project-summary-card financial-big">
            📊 Comprehensive Financial Overview
          </div>
        </div>
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
      content: createCards(2),
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

export default WeeklyProjectSummary;
