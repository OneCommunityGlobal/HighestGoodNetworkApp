/* eslint-disable import/no-unresolved */
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import PaidLaborCost from './PaidLaborCost/PaidLaborCost';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';
import QuantityOfMaterialsUsed from './QuantityOfMaterialsUsed/QuantityOfMaterialsUsed';
import InjuryCategoryBarChart from './GroupedBarGraphInjurySeverity/InjuryCategoryBarChart';
import ToolsHorizontalBarChart from './Tools/ToolsHorizontalBarChart';
import ExpenseBarChart from './Financials/ExpenseBarChart';
import ActualVsPlannedCost from './ActualVsPlannedCost/ActualVsPlannedCost';
import TotalMaterialCostPerProject from './TotalMaterialCostPerProject/TotalMaterialCostPerProject';
import styles from './WeeklyProjectSummary.module.css';
import IssueCharts from '../Issues/openIssueCharts';
import SupplierPerformanceGraph from './SupplierPerformanceGraph.jsx';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import ToolsStoppageHorizontalBarChart from './Tools/ToolsStoppageHorizontalBarChart/ToolsStoppageHorizontalBarChart';

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

export function WeeklyProjectSummaryContent() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});

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
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});
  const darkMode = useSelector(state => state.theme.darkMode);

  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchAllMaterials());
    }
  }, [dispatch, materials.length]);

  const quantityOfMaterialsUsedData = useMemo(() => {
    if (!materials.length) return [];
    const uniqueMaterials = Array.from(new Map(materials.map(m => [m._id, m])).values());
    return uniqueMaterials;
  }, [materials]);

  const toggleSection = category => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const sections = useMemo(
    () => [
      {
        title: 'Project Status',
        key: 'Project Status',
        className: 'full',
        content: (
          <div className={`${styles.projectStatusGrid}`}>
            {projectStatusButtons.map(button => {
              const uniqueId = uuidv4();
              return (
                <div
                  key={uniqueId}
                  className={`${styles.weeklyProjectSummaryCard} ${styles.statusCard}`}
                  style={{ backgroundColor: button.bgColor }} // Dynamic Background
                >
                  <div className={`${styles.weeklyCardTitle}`}>{button.title}</div>
                  <div
                    className={`${styles.weeklyStatusButton}`}
                    style={{ backgroundColor: button.buttonColor }} // Dynamic Oval Color
                  >
                    <span className={`${styles.weeklyStatusValue}`}>{button.value}</span>
                  </div>
                  <div
                    className="weekly-status-change"
                    style={{ color: button.textColor }} // Dynamic Change Color
                  >
                    {button.change}
                  </div>
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
        content: [1, 2, 3].map((_, index) => {
          let content;
          if (index === 1) {
            content = <QuantityOfMaterialsUsed data={quantityOfMaterialsUsedData} />;
          } else if (index === 2) {
            content = <TotalMaterialCostPerProject />;
          } else {
            content = <p>📊 Card</p>;
          }
          const uniqueId = uuidv4();
          return (
            <div
              key={uniqueId}
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
            >
              {content}
            </div>
          );
        }),
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
        content: (
          <>
            {/* <div className="weekly-project-summary-card normal-card tools-tracking-layout"> */}
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <ToolStatusDonutChart />
            </div>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <ToolsHorizontalBarChart darkMode={darkMode} />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
              style={{ minHeight: '300px', gridColumn: 'span 2' }}
            >
              <SupplierPerformanceGraph />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
              style={{ minHeight: '300px', gridColumn: 'span 2' }}
            >
              <ToolsStoppageHorizontalBarChart />
            </div>
          </>
        ),
      },
      {
        title: 'Lessons Learned',
        key: 'Lessons Learned',
        className: 'half',
        content: (
          <div className="weekly-project-summary-card normal-card" style={{ gridColumn: '1 / -1' }}>
            <InjuryCategoryBarChart />
          </div>
        ),
      },
      {
        title: 'Financials',
        key: 'Financials',
        className: 'large',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
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
        title: 'Global Distribution and Project Status',
        key: 'Global Distribution and Project Status',
        className: 'half',
        content: (
          <>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.wideCard}`}>
              📊 Wide Card
            </div>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              📊 Normal Card
            </div>
          </>
        ),
      },
      {
        title: 'Labor and Time Tracking',
        key: 'Labor and Time Tracking',
        className: 'half',
        content: [1, 2].map((_, index) => {
          const uniqueId = uuidv4();
          return (
            <div
              key={uniqueId}
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
            >
              {index === 1 ? <PaidLaborCost /> : '📊 Card'}
            </div>
          );
        }),
      },
      {
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        content: [1, 2, 3, 4].map((_, index) => {
          const uniqueId = uuidv4();
          return (
            <div key={uniqueId} className="weekly-project-summary-card normal-card">
              {index === 3 ? <ActualVsPlannedCost /> : '📊 Card'}
            </div>
          );
        }),
      },
    ],
    [quantityOfMaterialsUsedData, darkMode],
  );

  const handleSaveAsPDF = async () => {
    const currentOpenSections = { ...openSections };

    try {
      const allSectionsOpen = {};
      sections.forEach(section => {
        allSectionsOpen[section.key] = true;
      });
      setOpenSections(allSectionsOpen);

      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 500));

      const contentElement = document.querySelector('.weekly-project-summary-container');
      if (!contentElement) throw new Error('Weekly project summary container not found.');

      const pdfContainer = document.createElement('div');
      pdfContainer.id = 'pdf-export-container';
      Object.assign(pdfContainer.style, {
        width: '420mm',
        padding: '10mm',
        backgroundColor: '#fff',
        position: 'absolute',
        left: '-9999px',
        boxSizing: 'border-box',
      });

      const clonedContent = contentElement.cloneNode(true);

      // Remove buttons and controls not needed in PDF
      clonedContent
        .querySelectorAll(
          'button, .weekly-project-summary-dropdown-icon, .no-print, .weekly-summary-header-controls',
        )
        .forEach(el => el.parentNode?.removeChild(el));

      const styleElem = document.createElement('style');
      styleElem.textContent = `
          img, svg {
          height: auto !important;
          page-break-inside: avoid !important;
        }
      `;

      clonedContent.prepend(styleElem);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff',
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
      });

      if (!canvas) throw new Error('Failed to capture content as image.');

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdfWidth = 210;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, imgHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);

      const now = new Date();
      const fileName = `weekly-project-summary-${now.toISOString().slice(0, 10)}.pdf`;

      // Save the PDF
      pdf.save(fileName);

      document.body.removeChild(pdfContainer);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', err);
    } finally {
      setOpenSections(currentOpenSections);
    }
  };

  return (
    <div className={`${styles.weeklyProjectSummaryContainer} ${darkMode ? styles.darkMode : ''}`}>
      <WeeklyProjectSummaryHeader handleSaveAsPDF={handleSaveAsPDF} />
      <div className={`${styles.weeklyProjectSummaryDashboardContainer}`}>
        <div className={`${styles.weeklyProjectSummaryDashboardGrid}`}>
          {sections.map(({ title, key, className, content }) => (
            <div
              key={key}
              className={`${styles.weeklyProjectSummaryDashboardSection} ${styles[className]}`}
            >
              <button
                type="button"
                className={styles.weeklyProjectSummaryDashboardCategoryTitle}
                onClick={() => toggleSection(key)}
              >
                {title} <span>{openSections[key] ? '∧' : '∨'}</span>
              </button>
              {openSections[key] && (
                <div className={`${styles.weeklyProjectSummaryDashboardCategoryContent}`}>
                  {content}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyProjectSummary;
