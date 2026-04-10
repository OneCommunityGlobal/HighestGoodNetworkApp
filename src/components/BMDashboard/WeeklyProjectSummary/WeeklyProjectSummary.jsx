/* eslint-disable import/no-unresolved */
import { useState, useEffect, useMemo, useCallback } from 'react';
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
import FinancialsTrackingCard from './ExpenditureChart/FinancialsTrackingCard';
import EmbedInteractiveMap from '../InteractiveMap/EmbedInteractiveMap';
import InteractiveMap from '../InteractiveMap/InteractiveMap';
import styles from './WeeklyProjectSummary.module.css';
import IssueCharts from '../Issues/openIssueCharts';
import SupplierPerformanceGraph from './SupplierPerformanceGraph.jsx';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords.jsx';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import FinancialStatButtons from './Financials/FinancialStatButtons';

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

const financialData = [
  {
    id: uuidv4(),
    title: 'Total Project Cost',
    value: '-',
    bgColor: '#E0F2FE',
    textColor: '#0369A1',
  },
  {
    id: uuidv4(),
    title: 'Total Material Cost',
    value: '-',
    bgColor: '#F3E8FF',
    textColor: '#6D28D9',
  },
  {
    id: uuidv4(),
    title: 'Total Labor Cost',
    value: '-',
    bgColor: '#FEE2E2',
    textColor: '#B91C1C',
  },
  {
    id: uuidv4(),
    title: 'Total Equipment Cost',
    value: '-',
    bgColor: '#DCFCE7',
    textColor: '#15803D',
  },
];

export function WeeklyProjectSummaryContent() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});
}

function WeeklyProjectSummary() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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

  const toggleSection = useCallback(category => {
    setOpenSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

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
      // New Issues Breakdown card
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
        title: 'Material Consumption',
        key: 'Material Consumption',
        className: 'full',
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
        title: 'Issues Breakdown',
        key: 'Issues Breakdown',
        className: 'full',
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            <IssuesBreakdownChart />
          </div>
        ),
      },
      {
        title: 'Tools and Equipment Tracking',
        key: 'Tools and Equipment Tracking',
        className: 'half',
        content: [
          <div
            key="donut-chart"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
          >
            <ToolStatusDonutChart />
          </div>,
          <div
            key="bar-chart"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
          >
            <ToolsHorizontalBarChart darkMode={darkMode} />
          </div>,
        ],
      },
      {
        title: 'Lessons Learned',
        key: 'Lessons Learned',
        className: 'half',
        content: [
          <div
            key="frequent-tags-card"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
            style={{ minHeight: '520px', height: 'auto', overflow: 'visible' }}
          >
            <MostFrequentKeywords darkMode={darkMode} />
          </div>,
          <div
            key="injury-chart"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
          >
            <InjuryCategoryBarChart />
          </div>,
        ],
      },
      {
        title: 'Financials',
        key: 'Financials',
        className: 'large',
        content: (
          <div className={`${styles.financialGrid}`}>
            <div className="weekly-project-summary-card financial-small financial-chart">
              <FinancialStatButtons darkMode={darkMode} />
            </div>
            <div className="weekly-project-summary-card financial-small financial-chart">
              <ExpenseBarChart darkMode={darkMode} />
            </div>
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
        content: [1, 2].map((_, index) => {
          const uniqueId = uuidv4();
          return (
            <div
              key={uniqueId}
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
            >
              {index === 1 ? <PaidLaborCost /> : <DistributionLaborHours />}
            </div>
          );
        }),
      },
      {
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        content: (
          <div className={styles.financialsTrackingGrid}>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <FinancialsTrackingCard />
            </div>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>📊 Card</div>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <CostPredictionChart projectId={1} />
            </div>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <ActualVsPlannedCost />
            </div>
          </div>
        ),
      },
    ],
    [quantityOfMaterialsUsedData, darkMode],
  );

  const handleSaveAsPDF = useCallback(async () => {
    const currentOpenSections = { ...openSections };
    setIsGeneratingPDF(true);

    try {
      // Open all sections for PDF capture
      const allSectionsOpen = {};
      sections.forEach(section => {
        allSectionsOpen[section.key] = true;
      });
      setOpenSections(allSectionsOpen);

      // Wait for sections to open and re-render
      await new Promise(resolve => setTimeout(resolve, 800));

      const contentElement = document.querySelector(`.${styles.weeklyProjectSummaryContainer}`);
      if (!contentElement) throw new Error('Weekly project summary container not found.');

      const pdfContainer = document.createElement('div');
      pdfContainer.id = 'pdf-export-container';
      Object.assign(pdfContainer.style, {
        width: '420mm',
        padding: '10mm',
        backgroundColor: '#fff',
        position: 'absolute',
        left: '-9999px',
        top: '0',
        boxSizing: 'border-box',
        zIndex: '-9999',
      });

      const clonedContent = contentElement.cloneNode(true);

      // Remove interactive elements for PDF
      clonedContent
        .querySelectorAll('button, .weekly-project-summary-dropdown-icon, .no-print, iframe')
        .forEach(el => el.parentNode?.removeChild(el));

      // Ensure charts are visible
      const styleElem = document.createElement('style');
      styleElem.textContent = `
        img, svg, canvas {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
        }
        .${styles.weeklyProjectSummaryDashboardCategoryContent} {
          display: block !important;
        }
      `;

      clonedContent.prepend(styleElem);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
        onclone: clonedDoc => {
          // Ensure all sections are visible in the cloned document
          const sections = clonedDoc.querySelectorAll(
            `.${styles.weeklyProjectSummaryDashboardCategoryContent}`,
          );
          sections.forEach(section => {
            section.style.display = 'block';
          });
        },
      });

      if (!canvas) throw new Error('Failed to capture content as image.');

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdfWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // FIXED: Using Math.max() instead of ternary for better readability
      const pdfHeight = Math.max(imgHeight, 297); // Min A4 height

      const pdf = new jsPDF({
        orientation: imgHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);

      const now = new Date();
      const fileName = `weekly-project-summary-${now.toISOString().slice(0, 10)}.pdf`;

      pdf.save(fileName);

      document.body.removeChild(pdfContainer);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setOpenSections(currentOpenSections);
      setIsGeneratingPDF(false);
    }
  }, [openSections, sections, styles]);

  return (
    <div className={`${styles.weeklyProjectSummaryContainer} ${darkMode ? styles.darkMode : ''}`}>
      {/* Header Section - Now inline instead of seperate component */}
      <div className={styles.weeklySummaryHeaderWrapper}>
        <div className={styles.weeklySummaryHeaderContainer}>
          <h1 className={styles.weeklySummaryHeaderTitle}>
            Weekly Project Summary
            <span className={styles.weeklySummaryHeaderSubtitle}>One Community</span>
          </h1>
          <div className={styles.weeklySummaryHeaderControls}>
            <select aria-label="Select project">
              <option value="">Select Project</option>
              <option value="project1">Project Alpha</option>
              <option value="project2">Project Beta</option>
              <option value="project3">Project Gamma</option>
              <option value="project4">Project Delta</option>
            </select>
            <button
              className={styles.weeklySummaryShareBtn}
              onClick={handleSaveAsPDF}
              disabled={isGeneratingPDF}
              type="button"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Share PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
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
                aria-expanded={openSections[key]}
              >
                {title}
                {/* FIXED: Added proper spacing with a space before the span */}
                <span aria-hidden="true"> {openSections[key] ? '∧' : '∨'}</span>
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
