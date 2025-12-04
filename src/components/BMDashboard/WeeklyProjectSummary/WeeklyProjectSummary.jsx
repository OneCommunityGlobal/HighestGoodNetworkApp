// --- WeeklyProjectSummary.jsx ---
/* eslint-disable import/no-unresolved */
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import CostPredictionChart from './CostPredictionChart';
import ToolStatusDonutChart from './ToolStatusDonutChart/ToolStatusDonutChart';
import PaidLaborCost from './PaidLaborCost/PaidLaborCost';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';
import QuantityOfMaterialsUsed from './QuantityOfMaterialsUsed/QuantityOfMaterialsUsed';
import ProjectRiskProfileOverview from './ProjectRiskProfileOverview';
import IssuesBreakdownChart from './IssuesBreakdownChart';
import InjuryCategoryBarChart from './GroupedBarGraphInjurySeverity/InjuryCategoryBarChart';
import ToolsHorizontalBarChart from './Tools/ToolsHorizontalBarChart';
import ExpenseBarChart from './Financials/ExpenseBarChart';
import ActualVsPlannedCost from './ActualVsPlannedCost/ActualVsPlannedCost';
import TotalMaterialCostPerProject from './TotalMaterialCostPerProject/TotalMaterialCostPerProject';
import EmbedInteractiveMap from '../InteractiveMap/EmbedInteractiveMap';
import IssueCharts from '../Issues/openIssueCharts';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import InjurySeverityChart from '../Injuries/InjurySeverityChart';

import styles from './WeeklyProjectSummary.module.css';

const projectStatusButtons = [
  {
    title: 'Total Projects',
    value: 426,
    change: '+16% week over week',
    bgColor: '#F0FFEE',
    buttonColor: '#BAF0B6',
    textColor: '#328D1B',
  },
  {
    title: 'Completed Projects',
    value: 127,
    change: '+14% week over week',
    bgColor: '#F3FCFF',
    buttonColor: '#C1EFFB',
    textColor: '#328D1B',
  },
  {
    title: 'Delayed Projects',
    value: 34,
    change: '-18% week over week',
    bgColor: '#FFE9FA',
    buttonColor: '#FECFF3',
    textColor: '#C82F2F',
  },
  {
    title: 'Active Projects',
    value: 265,
    change: '+3% week over week',
    bgColor: '#E8E8FF',
    buttonColor: '#CBCBFE',
    textColor: '#328D1B',
  },
  {
    title: 'Avg Project Duration',
    value: '17 hrs',
    change: '+13% week over week',
    bgColor: '#FFF6EE',
    buttonColor: '#FFD8A5',
    textColor: '#FFD8A5',
  },
  {
    title: 'Total Material Cost',
    value: '$27.6K',
    change: '+9% week over week',
    bgColor: '#FFF3F3',
    buttonColor: '#FBC1C2',
    textColor: '#328D1B',
  },
  {
    title: 'Total Material Used',
    value: '2714',
    change: '+11% week over week',
    bgColor: '#DAC8FF',
    buttonColor: '#B28ECC',
    textColor: '#328D1B',
  },
  {
    title: 'Active Projects',
    value: '265',
    change: '+3% week over week',
    bgColor: '#E8E8FF',
    buttonColor: '#CBCBFE',
    textColor: '#328D1B',
  },
  {
    title: 'Total Labor Hours Invested',
    value: '12.8K',
    change: '+17% week over week',
    bgColor: '#E5C1FC',
    buttonColor: '#F6E1FB',
    textColor: '#328D1B',
  },
  {
    title: 'Total Labor Cost',
    value: '$18.4K',
    change: '+14% week over week',
    bgColor: '#FFFDF3',
    buttonColor: '#FBF9C1',
    textColor: '#328D1B',
  },
  {
    title: 'Material Available',
    value: 693,
    change: '-8% week over week',
    bgColor: '#B4D9C5',
    buttonColor: '#31BD41',
    textColor: '#C82F2F',
  },
  {
    title: 'Material Wasted',
    value: 879,
    change: '+14% week over week',
    bgColor: '#EFBABB',
    buttonColor: '#F79395',
    textColor: '#328D1B',
  },
];

function WeeklyProjectSummary() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const darkMode = useSelector(state => state.theme.darkMode);

  const [openSections, setOpenSections] = useState({});

  useEffect(() => {
    if (materials.length === 0) dispatch(fetchAllMaterials());
  }, [dispatch, materials.length]);

  const quantityOfMaterialsUsedData = useMemo(() => {
    if (!materials.length) return [];
    return Array.from(new Map(materials.map(m => [m._id, m])).values());
  }, [materials]);

  const toggleSection = key => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = useMemo(
    () => [
      {
        title: 'Risk profile for projects',
        key: 'Risk profile for projects',
        className: 'full',
        content: <ProjectRiskProfileOverview />,
      },
      {
        title: 'Project Status',
        key: 'Project Status',
        className: 'full',
        content: (
          <div className={styles.projectStatusGrid}>
            {projectStatusButtons.map(button => (
              <div
                key={uuidv4()}
                className={`${styles.weeklyProjectSummaryCard} ${styles.statusCard}`}
                style={{ backgroundColor: button.bgColor }}
              >
                <div
                  className={styles.weeklyCardTitle}
                  style={{ color: '#000' }} // FIX: always visible
                >
                  {button.title}
                </div>

                <div
                  className={styles.weeklyStatusButton}
                  style={{ backgroundColor: button.buttonColor }}
                >
                  <span className={styles.weeklyStatusValue}>{button.value}</span>
                </div>

                <div className="weekly-status-change" style={{ color: button.textColor }}>
                  {button.change}
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: 'Issues Breakdown',
        key: 'Issues Breakdown',
        className: 'full',
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.fullCard}`}>
            <IssuesBreakdownChart />
          </div>
        ),
      },
      {
        title: 'Injury Severity by Projects',
        key: 'Injury Severity by Projects',
        className: 'full',
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.fullCard}`}>
            <InjurySeverityChart />
          </div>
        ),
      },
      {
        title: 'Material Consumption',
        key: 'Material Consumption',
        className: 'large',
        content: [0, 1, 2].map(idx => (
          <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            {idx === 1 ? (
              <QuantityOfMaterialsUsed data={quantityOfMaterialsUsedData} />
            ) : idx === 2 ? (
              <TotalMaterialCostPerProject />
            ) : (
              <p>📊 Card</p>
            )}
          </div>
        )),
      },
      {
        title: 'Issue Tracking',
        key: 'Issue Tracking',
        className: 'full',
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            <IssueCharts />
          </div>
        ),
      },
      {
        title: 'Tools and Equipment Tracking',
        key: 'Tools and Equipment Tracking',
        className: 'half',
        content: [
          <div key="donut" className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            <ToolStatusDonutChart />
          </div>,
          <div key="bar" className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            <ToolsHorizontalBarChart darkMode={darkMode} />
          </div>,
        ],
      },
      {
        title: 'Lessons Learned',
        key: 'Lessons Learned',
        className: 'half',
        content: [
          <MostFrequentKeywords key="keywords" />,
          <div key="injury" className="weekly-project-summary-card normal-card">
            <InjuryCategoryBarChart />
          </div>,
        ],
      },
      {
        title: 'Financials',
        key: 'Financials',
        className: 'large',
        content: (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}
          >
            <div className="weekly-project-summary-card financial-small">📊 Card</div>
            <div className="weekly-project-summary-card financial-small financial-chart">
              <ExpenseBarChart />
            </div>
            <div className="weekly-project-summary-card financial-small">📊 Card</div>
            <div className="weekly-project-summary-card financial-small">📊 Card</div>
            <div className="weekly-project-summary-card financial-big">📊 Big Card</div>
          </div>
        ),
      },
      {
        title: 'Loss Tracking',
        key: 'Loss Tracking',
        className: 'small',
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>📊 Card</div>
        ),
      },
      {
        title: 'Global Distribution and Project Status Overview',
        key: 'Global Distribution and Project Status',
        className: 'full',
        content: (
          <div
            className={`${styles.weeklyProjectSummaryCard} ${styles.mapCard}`}
            style={{ height: '500px', padding: '0' }}
          >
            <EmbedInteractiveMap />
          </div>
        ),
      },
      {
        title: 'Labor and Time Tracking',
        key: 'Labor and Time Tracking',
        className: 'half',
        content: [0, 1].map(i => (
          <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            {i === 1 ? <PaidLaborCost /> : <DistributionLaborHours />}
          </div>
        )),
      },
      {
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        content: [0, 1, 2, 3].map(i => (
          <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            {i === 2 ? (
              <CostPredictionChart projectId={1} />
            ) : i === 3 ? (
              <ActualVsPlannedCost />
            ) : (
              '📊 Card'
            )}
          </div>
        )),
      },
    ],
    [quantityOfMaterialsUsedData, darkMode],
  );

  return (
    <div className={`weeklyProjectSummaryContainer ${darkMode ? 'dark-mode' : ''}`}>
      <WeeklyProjectSummaryHeader darkMode={darkMode} />

      <div className={styles.weeklyProjectSummaryDashboardContainer}>
        <div className={styles.weeklyProjectSummaryDashboardGrid}>
          {sections.map(({ title, key, className, content }) => (
            <div
              key={key}
              className={`${styles.weeklyProjectSummaryDashboardSection} ${styles[className]}`}
            >
              {/* FIX: Title always visible */}
              <button
                type="button"
                className={styles.weeklyProjectSummaryDashboardCategoryTitle}
                style={{ color: '#000' }} // always readable
                onClick={() => toggleSection(key)}
              >
                {title} <span>{openSections[key] ? '∧' : '∨'}</span>
              </button>

              {openSections[key] && (
                <div className={styles.weeklyProjectSummaryDashboardCategoryContent}>{content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyProjectSummary;
