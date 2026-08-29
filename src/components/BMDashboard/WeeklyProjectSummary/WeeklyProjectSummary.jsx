// --- WeeklyProjectSummary.jsx ---
/* eslint-disable import/no-unresolved */
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import PaidLaborCost from './PaidLaborCost/PaidLaborCost';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';
import QuantityOfMaterialsUsed from './QuantityOfMaterialsUsed/QuantityOfMaterialsUsed';
import ProjectRiskProfileOverview from './ProjectRiskProfileOverview';
import IssuesBreakdownChart from './IssuesBreakdownChart';
import InjuryCategoryBarChart from './GroupedBarGraphInjurySeverity/InjuryCategoryBarChart';
import ToolsHorizontalBarChart from './Tools/ToolsHorizontalBarChart';
import ExpenseBarChart from './Financials/ExpenseBarChart';
import CostBreakDown from './Financials/CostBreakDown/CostBreakDown';
import TotalMaterialCostPerProject from './TotalMaterialCostPerProject/TotalMaterialCostPerProject';
import IssueCharts from '../Issues/openIssueCharts';
import InteractiveMap from '../InteractiveMap/InteractiveMap';
import LossTrackingLineChart from './Financials/LossTrackingLineCharts/LossTrackingLineChart';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords';
import LessonsLearntChart from '../LessonsLearnt/LessonsLearntChart';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import ActualVsPlannedCost from './ActualVsPlannedCost/ActualVsPlannedCost';

import styles from './WeeklyProjectSummary.module.css';
import ToolStatusDonutChart from './ToolStatusDonutChart/ToolStatusDonutChart';
import InjurySeverityChart from '../Injuries/InjurySeverityChart';
import CostPredictionChart from './CostPredictionChart';

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

function renderFinancialCard(i) {
  if (i === 2) return <CostPredictionChart projectId={1} />;
  if (i === 3) return <ActualVsPlannedCost />;
  return <div>📊 Card</div>;
}

function renderMaterialCard(idx, quantityOfMaterialsUsedData) {
  if (idx === 1) return <QuantityOfMaterialsUsed data={quantityOfMaterialsUsedData} />;
  if (idx === 2) return <TotalMaterialCostPerProject />;
  return <p>📊 Card</p>;
}

function renderProjectStatusGrid() {
  return (
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
  );
}

function renderMaterialConsumptionCards(quantityOfMaterialsUsedData) {
  return [0, 1, 2].map(idx => (
    <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
      {renderMaterialCard(idx, quantityOfMaterialsUsedData)}
    </div>
  ));
}

function renderLaborTrackingCard(i) {
  return i === 1 ? <PaidLaborCost /> : <DistributionLaborHours />;
}

function renderLaborTrackingCards() {
  return [0, 1].map(i => (
    <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
      {renderLaborTrackingCard(i)}
    </div>
  ));
}

function renderFinancialsTrackingCards() {
  return [0, 1, 2, 3].map(i => (
    <div key={uuidv4()} className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
      {renderFinancialCard(i)}
    </div>
  ));
}

function DashboardSection({ title, sectionKey, className, content, isOpen, onToggle }) {
  return (
    <div className={`${styles.weeklyProjectSummaryDashboardSection} ${styles[className]}`}>
      <button
        type="button"
        className={styles.weeklyProjectSummaryDashboardCategoryTitle}
        onClick={() => onToggle(sectionKey)}
      >
        {title} <span>{isOpen ? '∧' : '∨'}</span>
      </button>

      {isOpen && (
        <div className={styles.weeklyProjectSummaryDashboardCategoryContent}>{content}</div>
      )}
    </div>
  );
}

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
        content: renderProjectStatusGrid(),
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
        content: renderMaterialConsumptionCards(quantityOfMaterialsUsedData),
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
        className: 'full',
        content: [
          <div
            key="frequent-tags-card"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
            style={{ minHeight: '520px', height: 'auto', overflow: 'visible' }}
          >
            <MostFrequentKeywords />
          </div>,
          <div
            key="injury-chart"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
          >
            <InjuryCategoryBarChart />
          </div>,
          <div
            key="lessons-learnt-chart"
            className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
          >
            <LessonsLearntChart darkMode={darkMode} />
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

            {/* Bottom: Cost Breakdown Pie Chart (Spans across both columns) */}
            <div
              className="weekly-project-summary-card financial-big"
              style={{ gridColumn: 'span 2', width: '100%', minHeight: '400px' }}
            >
              <CostBreakDown />
            </div>
          </div>
        ),
      },
      {
        title: 'Loss Tracking',
        key: 'Loss Tracking',
        className: 'large',
        content: (
          <div className="weekly-project-summary-card financial-big">
            <LossTrackingLineChart />
          </div>
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
            <InteractiveMap />
          </div>
        ),
      },
      {
        title: 'Labor and Time Tracking',
        key: 'Labor and Time Tracking',
        className: 'half',
        content: renderLaborTrackingCards(),
      },
      {
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        content: renderFinancialsTrackingCards(),
      },
    ],
    [quantityOfMaterialsUsedData, darkMode],
  );

  const handleSaveAsPDF = async () => {
    // Prevent multiple simultaneous PDF generations
    if (isGeneratingPDF) {
      return;
    }

    const currentOpenSections = { ...openSections };
    setIsGeneratingPDF(true);

    // Show loading toast
    const loadingToastId = toast.info('Generating PDF...', {
      position: 'top-right',
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: false,
    });

    try {
      // Open all sections for PDF export
      const allSectionsOpen = {};
      sections.forEach(section => {
        allSectionsOpen[section.key] = true;
      });
      setOpenSections(allSectionsOpen);

      // Wait for sections to render
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to find the container using ref first, then fallback to querySelector
      const contentElement =
        containerRef.current || document.querySelector(`.${styles.weeklyProjectSummaryContainer}`);
      if (!contentElement) {
        throw new Error(
          'Weekly project summary container not found. Please refresh the page and try again.',
        );
      }

      // Create PDF container
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
        zIndex: '-1',
      });

      // Clone the content
      const clonedContent = contentElement.cloneNode(true);

      clonedContent
        .querySelectorAll(
          'button, .weekly-project-summary-dropdown-icon, .no-print, .weekly-summary-header-controls',
        )
        .forEach(el => {
          el.remove();
        });

      // Add styles for PDF
      const styleElem = document.createElement('style');
      styleElem.textContent = `
        img, svg {
          height: auto !important;
          page-break-inside: avoid !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;

      clonedContent.prepend(styleElem);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      // Wait a bit for styles to apply
      // eslint-disable-next-line no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, 300));

      // Generate canvas from HTML
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff',
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
        allowTaint: false,
      });

      if (!canvas) {
        throw new Error('Failed to capture content as image. Please try again.');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to generate image data. Please try again.');
      }

      const pdfWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      // Create PDF
      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({
        orientation: imgHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, imgHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);

      // Generate filename with project and date range
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const projectName = projectFilter || 'All-Projects';
      const dateRange = dateRangeFilter
        ? dateRangeFilter.replace(/\s+/g, '-').replace(/,/g, '')
        : dateStr;
      const fileName = `weekly-project-summary-${projectName}-${dateRange}.pdf`;

      pdf.save(fileName);

      // Clean up
      if (document.body.contains(pdfContainer)) {
        pdfContainer.remove();
      }

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success('PDF generated and downloaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', err);
      // eslint-disable-next-line no-alert
      alert('Failed to generate PDF. Please try again.');
      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show error message
      const errorMessage =
        err?.message ||
        'Failed to generate PDF. Please try again or contact support if the issue persists.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
      });

      // Log error for debugging
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', err);

      // Clean up PDF container if it exists
      const pdfContainer = document.getElementById('pdf-export-container');
      if (pdfContainer && document.body.contains(pdfContainer)) {
        pdfContainer.remove();
      }
    } finally {
      setOpenSections(currentOpenSections);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={`weeklyProjectSummaryContainer ${darkMode ? styles.darkMode : ''}`}>
      <WeeklyProjectSummaryHeader darkMode={darkMode} />

      <div className={styles.weeklyProjectSummaryDashboardContainer}>
        <div className={styles.weeklyProjectSummaryDashboardGrid}>
          {sections.map(({ title, key, className, content }) => (
            <DashboardSection
              key={key}
              title={title}
              sectionKey={key}
              className={className}
              content={content}
              isOpen={!!openSections[key]}
              onToggle={toggleSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeeklyProjectSummary;
