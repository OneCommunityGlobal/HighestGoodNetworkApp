// export default WeeklyProjectSummary;

/* eslint-disable import/no-unresolved */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import CardSelector from './CardSelector';
import PaidLaborCost from './PaidLaborCost/PaidLaborCost';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';

import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import {
  fetchWeeklyProjectSummaryProjectStatus,
  getWeeklyProjectSummaryProjectStatusRequestKey,
} from '../../../actions/bmdashboard/weeklyProjectSummaryActions';
import IssuesCharts from '../Issues/LongestOpenIssuesChart';
import ProjectRiskProfileOverview from './ProjectRiskProfileOverview';
import IssuesBreakdownChart from './IssuesBreakdownChart';
import InjuryCategoryBarChart from './GroupedBarGraphInjurySeverity/InjuryCategoryBarChart';
import ToolsHorizontalBarChart from './Tools/ToolsHorizontalBarChart';
import ExpenseBarChart from './Financials/ExpenseBarChart';
import CostVarianceTrendGraph from './Financials/CostVarianceTrendGraph';
import CostBreakDown from './Financials/CostBreakDown/CostBreakDown';
import FinancialsTrackingSection from './ExpenditureChart/FinancialsTrackingSection';
import InteractiveMap from '../InteractiveMap/InteractiveMap';
import styles from './WeeklyProjectSummary.module.css';
import LossTrackingLineChart from './Financials/LossTrackingLineCharts/LossTrackingLineChart';
import SupplierPerformanceGraph from './SupplierPerformanceGraph.jsx';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords';
import LessonsLearntChart from '../LessonsLearnt/LessonsLearntChart';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import { MaterialConsumptionCards } from './MaterialConsumption/MaterialConsumption';
import ToolsStoppageHorizontalBarChart from './Tools/ToolsStoppageHorizontalBarChart/ToolsStoppageHorizontalBarChart';
import ToolStatusDonutChart from './ToolStatusDonutChart/ToolStatusDonutChart';
import RentalChart from '../RentalChart/RentalChart';
import ReturnedLateChart from '../RentalChart/ReturnedLateChart';
import InjurySeverityChart from '../Injuries/InjurySeverityChart';
import { calculateComparisonDates, parseWeeklySummaryDateRange } from './comparisonDateUtils';
import { StatusCardGrid, buildStatusCards, toCardButtons } from './StatusCards';
import FinancialOverview from './Financials/FinancialOverview';

const projectStatusButtonData = [
  ['Total Projects', 'totalProjects', '#F0FFEE', '#BAF0B6', '#328D1B'],
  ['Completed Projects', 'completedProjects', '#F3FCFF', '#C1EFFB', '#328D1B'],
  ['Delayed Projects', 'delayedProjects', '#FFE9FA', '#FECFF3', '#C82F2F'],
  ['Active Projects', 'activeProjects', '#E8E8FF', '#CBCBFE', '#328D1B'],
  ['Avg Completed Project Duration (hours)', 'avgProjectDuration', '#FFF6EE', '#FFD8A5', '#FFD8A5'],
  ['Total Material Cost', 'totalMaterialCost', '#FFF3F3', '#FBC1C2', '#328D1B'],
  ['Total Material Used', 'totalMaterialUsed', '#DAC8FF', '#B28ECC', '#328D1B'],
  ['Total Labor Hours Invested', 'totalLaborHoursInvested', '#E5C1FC', '#F6E1FB', '#328D1B'],
  ['Total Labor Cost', 'totalLaborCost', '#FFFDF3', '#FBF9C1', '#328D1B'],
  ['Material Available', 'materialAvailable', '#B4D9C5', '#31BD41', '#C82F2F'],
  ['Material Wasted', 'materialWasted', '#EFBABB', '#F79395', '#328D1B'],
];

const projectStatusButtons = toCardButtons(projectStatusButtonData).map(button => ({
  ...button,
  description:
    button.metricKey === 'avgProjectDuration'
      ? 'Start to completion for projects completed in the selected period.'
      : undefined,
}));

const EMPTY_PROJECT_STATUS_METRICS = {};

function getProjectStatusErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load Project Status data. Please try again.'
  );
}

// ---------- Share PDF helpers ----------
// Landscape A4, so wide sections (several charts in a row) stay readable
const PDF_PAGE = { width: 297, height: 210, margin: 10 };
const PDF_SECTION_TITLE_HEIGHT = 9;
const PDF_LOAD_TIMEOUT_MS = 20000;
const PDF_LOAD_POLL_MS = 400;
const PDF_STABLE_CHECKS = 3;
const PDF_CHART_SETTLE_MS = 800;

const waitFor = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// True while a chart or card in the element is still loading
const isStillLoading = element => {
  if (
    element.querySelector(
      '.spinner-border, .spinner-grow, [role="progressbar"], [aria-busy="true"]',
    )
  ) {
    return true;
  }
  return /\bloading\b/i.test(element.innerText || '');
};

// Waits until nothing in the element shows a loading state for a few checks in a row
// (or the time limit passes), so charts and cards are captured with their data
const waitForContentToLoad = async element => {
  const start = Date.now();
  let stableChecks = 0;
  while (Date.now() - start < PDF_LOAD_TIMEOUT_MS && stableChecks < PDF_STABLE_CHECKS) {
    stableChecks = isStillLoading(element) ? 0 : stableChecks + 1;
    // eslint-disable-next-line no-await-in-loop
    await waitFor(PDF_LOAD_POLL_MS);
  }
  // Let chart animations finish drawing
  await waitFor(PDF_CHART_SETTLE_MS);
};

// Applied only to html2canvas's copy of the page: hides filters, dropdowns and their labels, and
// resets text spacing settings that make html2canvas drop the spaces between words
const PDF_EXPORT_STYLES = `
  * {
    letter-spacing: normal !important;
    word-spacing: normal !important;
    font-variant-ligatures: none !important;
    text-rendering: auto !important;
    animation: none !important;
    transition: none !important;
  }
  button,
  input,
  select,
  textarea,
  label,
  .no-print,
  .react-datepicker-wrapper,
  .react-datepicker__input-container,
  [role="combobox"],
  [aria-haspopup="listbox"],
  [class*="-control"],
  [class*="indicatorContainer"],
  [class*="select__"],
  [class*="dropdown" i],
  [class*="select" i]:not(svg):not(svg *),
  div:has(> input),
  div:has(> select),
  div:has(> [role="combobox"]) {
    display: none !important;
  }
`;

const captureElement = element =>
  html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    onclone: clonedDocument => {
      const style = clonedDocument.createElement('style');
      style.textContent = PDF_EXPORT_STYLES;
      clonedDocument.head.appendChild(style);
    },
  });

// Adds a section title (as real, searchable PDF text) and its image, starting a new page when
// the section does not fit, and splitting sections taller than a page across pages.
// Returns the vertical position after the section.
const addSectionToPdf = (pdf, title, canvas, startY) => {
  const { width, height, margin } = PDF_PAGE;
  const contentWidth = width - margin * 2;
  const pageContentHeight = height - margin * 2;
  const pxPerMm = canvas.width / contentWidth;
  const sectionHeight = canvas.height / pxPerMm + PDF_SECTION_TITLE_HEIGHT;

  let y = startY;
  const fitsOnPage = sectionHeight <= pageContentHeight;
  const needsNewPage = fitsOnPage ? y + sectionHeight > height - margin : y > height / 2;
  if (y > margin && needsNewPage) {
    pdf.addPage();
    y = margin;
  }

  pdf.setFontSize(13);
  pdf.setTextColor(33, 37, 41);
  pdf.text(title, margin, y + 6);
  y += PDF_SECTION_TITLE_HEIGHT;

  let offsetPx = 0;
  while (offsetPx < canvas.height) {
    if (height - margin - y < 15) {
      pdf.addPage();
      y = margin;
    }
    const sliceHeightPx = Math.min(
      canvas.height - offsetPx,
      Math.floor((height - margin - y) * pxPerMm),
    );
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceHeightPx;
    slice
      .getContext('2d')
      .drawImage(
        canvas,
        0,
        offsetPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx,
      );

    const sliceHeightMm = sliceHeightPx / pxPerMm;
    pdf.addImage(
      slice.toDataURL('image/jpeg', 0.92),
      'JPEG',
      margin,
      y,
      contentWidth,
      sliceHeightMm,
    );
    offsetPx += sliceHeightPx;
    y += sliceHeightMm;
  }
  return y + 6;
};

function WeeklyProjectSummary() {
  const dispatch = useDispatch();
  const materials = useSelector(state => state.materials?.materialslist || []);
  const [openSections, setOpenSections] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const darkMode = useSelector(state => state.theme.darkMode);
  const projectFilter = useSelector(state => state.weeklyProjectSummary?.projectFilter || '');
  const dateRangeFilter = useSelector(state => state.weeklyProjectSummary?.dateRangeFilter || '');
  const comparisonPeriodFilter = useSelector(
    state => state.weeklyProjectSummary?.comparisonPeriodFilter || 'No Comparison',
  );
  const projectStatusData = useSelector(state => state.weeklyProjectSummary?.projectStatusData);
  const projectStatusLoading = useSelector(
    state => state.weeklyProjectSummary?.projectStatusLoading || false,
  );
  const projectStatusError = useSelector(state => state.weeklyProjectSummary?.projectStatusError);
  const projectStatusDataRequestKey = useSelector(
    state => state.weeklyProjectSummary?.projectStatusDataRequestKey,
  );
  const projectStatusErrorRequestKey = useSelector(
    state => state.weeklyProjectSummary?.projectStatusErrorRequestKey,
  );
  const containerRef = useRef(null);
  const userId = useSelector(state => state.auth?.user?.userid);
  const cardPrefsKey = `weeklyProjectSummaryCards:${userId || 'guest'}`;
  // Saved card selection per user: { visibleKeys, cardLimit }. null = show all.
  const [cardPrefs, setCardPrefs] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(cardPrefsKey) || 'null');
      setCardPrefs(saved && Array.isArray(saved.visibleKeys) ? saved : null);
    } catch {
      setCardPrefs(null);
    }
  }, [cardPrefsKey]);

  const comparisonEnabled = comparisonPeriodFilter !== 'No Comparison';

  const currentDateRange = useMemo(() => parseWeeklySummaryDateRange(dateRangeFilter), [
    dateRangeFilter,
  ]);

  const comparisonDateRange = useMemo(
    () =>
      calculateComparisonDates(
        comparisonPeriodFilter,
        currentDateRange.startDate,
        currentDateRange.endDate,
      ),
    [comparisonPeriodFilter, currentDateRange.startDate, currentDateRange.endDate],
  );

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

  const bmProjects = useSelector(state => state.bmProjects || []);

  const selectedProjectId = useMemo(() => {
    const selectedProject = bmProjects.find(project => project.name === projectFilter);
    return selectedProject?._id;
  }, [bmProjects, projectFilter]);

  const projectStatusRequestParams = useMemo(() => {
    if (!currentDateRange.startDate || !currentDateRange.endDate) return null;

    const params = {
      startDate: currentDateRange.startDate,
      endDate: currentDateRange.endDate,
    };

    if (selectedProjectId) {
      params.projectId = selectedProjectId;
    }

    if (comparisonEnabled) {
      if (!comparisonDateRange.comparisonStartDate || !comparisonDateRange.comparisonEndDate) {
        return null;
      }
      params.comparisonStartDate = comparisonDateRange.comparisonStartDate;
      params.comparisonEndDate = comparisonDateRange.comparisonEndDate;
    }

    return params;
  }, [
    currentDateRange.startDate,
    currentDateRange.endDate,
    selectedProjectId,
    comparisonEnabled,
    comparisonDateRange.comparisonStartDate,
    comparisonDateRange.comparisonEndDate,
  ]);

  const projectStatusRequestKey = useMemo(
    () =>
      projectStatusRequestParams
        ? getWeeklyProjectSummaryProjectStatusRequestKey(projectStatusRequestParams)
        : null,
    [projectStatusRequestParams],
  );

  // Fetch initial data
  useEffect(() => {
    if (materials.length === 0) {
      dispatch(fetchAllMaterials());
    }

    if (bmProjects.length === 0) {
      dispatch(fetchBMProjects());
    }
  }, [dispatch, materials.length, bmProjects.length]);

  useEffect(() => {
    if (!projectStatusRequestParams) return;

    dispatch(fetchWeeklyProjectSummaryProjectStatus(projectStatusRequestParams));
  }, [dispatch, projectStatusRequestParams]);

  const isProjectStatusDataCurrent =
    Boolean(projectStatusData) && projectStatusDataRequestKey === projectStatusRequestKey;
  const isProjectStatusErrorCurrent =
    Boolean(projectStatusError) && projectStatusErrorRequestKey === projectStatusRequestKey;
  const isProjectStatusLoading =
    Boolean(projectStatusRequestParams) &&
    (projectStatusLoading || (!isProjectStatusDataCurrent && !isProjectStatusErrorCurrent));
  const projectStatusDisplayError = isProjectStatusErrorCurrent ? projectStatusError : null;
  const showProjectStatusComparison =
    comparisonEnabled && !isProjectStatusLoading && !projectStatusDisplayError;

  const projectStatusMetrics =
    isProjectStatusDataCurrent && !isProjectStatusLoading && !projectStatusDisplayError
      ? projectStatusData?.current?.metrics || EMPTY_PROJECT_STATUS_METRICS
      : EMPTY_PROJECT_STATUS_METRICS;

  const projectStatusCards = useMemo(
    () => buildStatusCards(projectStatusButtons, projectStatusMetrics, comparisonPeriodFilter),
    [comparisonPeriodFilter, projectStatusMetrics],
  );

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
          <>
            {isProjectStatusLoading && (
              <div role="status" aria-live="polite">
                Loading Project Status data...
              </div>
            )}
            {projectStatusDisplayError && (
              <div role="alert">{getProjectStatusErrorMessage(projectStatusDisplayError)}</div>
            )}
            <StatusCardGrid
              cards={projectStatusCards}
              showComparison={showProjectStatusComparison}
              idPrefix="project-status"
            />
          </>
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
        // Shared with /bmdashboard/issuechart so the PR-required four-card grouping stays in sync.
        content: (
          <MaterialConsumptionCards
            quantityOfMaterialsUsedData={quantityOfMaterialsUsedData}
            comparisonMode={comparisonPeriodFilter}
            currentDateRange={currentDateRange}
            comparisonDateRange={comparisonDateRange}
          />
        ),
      },
      {
        title: 'Issue Tracking',
        key: 'Issue Tracking',
        className: 'small',
        content: <IssuesCharts bmProjects={bmProjects} />,
      },
      {
        title: 'Tools and Equipment Tracking',
        key: 'Tools and Equipment Tracking',
        className: 'full',
        content: (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gridColumn: '1 / -1',
              gap: '20px',
              width: '100%',
            }}
          >
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard} ${styles.toolsTrackingCard}`}
              style={{ width: '100%' }}
            >
              <ToolStatusDonutChart />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard} ${styles.toolsTrackingCard}`}
              style={{ width: '100%' }}
            >
              <ToolsHorizontalBarChart darkMode={darkMode} />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard} ${styles.toolsTrackingCard}`}
              style={{ width: '100%' }}
            >
              <SupplierPerformanceGraph />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard} ${styles.toolsTrackingCard}`}
              style={{ width: '100%' }}
            >
              <ToolsStoppageHorizontalBarChart />
            </div>
          </div>
        ),
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
              gap: '15px',
              width: '100%',
            }}
          >
            {/* Top Left: Planned vs Actual Cost */}
            <div
              className="weekly-project-summary-card financial-small financial-chart"
              style={{
                width: '100%',
                minHeight: '550px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ExpenseBarChart darkMode={darkMode} />
            </div>

            {/* Top Right: Cost Variance Trend */}
            <div
              className="weekly-project-summary-card financial-small financial-chart"
              style={{
                width: '100%',
                minHeight: '550px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CostVarianceTrendGraph darkMode={darkMode} />
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
            style={{ padding: '0' }}
          >
            <InteractiveMap />
          </div>
        ),
      },
      {
        title: 'Labor and Time Tracking',
        key: 'Labor and Time Tracking',
        className: 'full',
        content: (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '15px',
              width: '100%',
            }}
          >
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
              style={{ width: '100%', minHeight: '650px' }}
            >
              <DistributionLaborHours />
            </div>
            <div
              className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}
              style={{
                width: '100%',
                minHeight: '650px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <PaidLaborCost />
            </div>
          </div>
        ),
      },
      {
        title: 'Rental Tracking',
        key: 'Rental Tracking',
        className: 'full',
        content: (
          <div className={styles.fullWidthStack}>
            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <RentalChart />
            </div>

            <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
              <ReturnedLateChart />
            </div>
          </div>
        ),
      },
      {
        title: 'Financials: Overview',
        key: 'Financials: Overview',
        className: 'full',
        content: (
          <FinancialOverview
            requestParams={projectStatusRequestParams}
            comparisonPeriodFilter={comparisonPeriodFilter}
          />
        ),
      },
      {
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        content: (
          <div style={{ gridColumn: '1 / -1', width: '100%' }}>
            <FinancialsTrackingSection />
          </div>
        ),
      },
    ],
    [
      quantityOfMaterialsUsedData,
      darkMode,
      comparisonPeriodFilter,
      projectStatusCards,
      isProjectStatusLoading,
      projectStatusDisplayError,
      showProjectStatusComparison,
      currentDateRange,
      comparisonDateRange,
      projectStatusRequestParams,
    ],
  );

  const visibleKeys = cardPrefs?.visibleKeys ?? sections.map(section => section.key);
  const cardLimit = cardPrefs?.cardLimit ?? 'all';
  const selectedSections = sections.filter(section => visibleKeys.includes(section.key));
  const visibleSections =
    cardLimit === 'all' ? selectedSections : selectedSections.slice(0, Number(cardLimit));

  const handleCardsChange = (keys, limit) => {
    const next = { visibleKeys: keys, cardLimit: limit };
    setCardPrefs(next);
    try {
      localStorage.setItem(cardPrefsKey, JSON.stringify(next));
    } catch {
      // Storage unavailable (e.g. private browsing); keep the in-memory choice.
    }
  };

  const handleSaveAsPDF = async () => {
    // Prevent multiple simultaneous PDF generations
    if (isGeneratingPDF) {
      return;
    }

    const currentOpenSections = { ...openSections };
    setIsGeneratingPDF(true);

    // Show loading toast
    const loadingToastId = toast.info('Generating PDF... charts are loading', {
      position: 'top-right',
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: false,
    });

    try {
      // Open all sections, so their charts load before the export
      const allSectionsOpen = {};
      sections.forEach(section => {
        allSectionsOpen[section.key] = true;
      });
      setOpenSections(allSectionsOpen);

      // Wait for the sections to render, then for their charts and cards to finish loading
      await waitFor(500);
      const contentElement = containerRef.current;
      if (!contentElement) {
        throw new Error(
          'Weekly project summary container not found. Please refresh the page and try again.',
        );
      }
      await waitForContentToLoad(contentElement);

      const sectionElements = Array.from(contentElement.querySelectorAll('[data-pdf-section]'));
      if (!sectionElements.length) {
        throw new Error('No sections to export. Choose at least one card and try again.');
      }

      // eslint-disable-next-line new-cap
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const { margin } = PDF_PAGE;
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);

      // Report header as real text (searchable, no overlapping dates)
      pdf.setFontSize(18);
      pdf.setTextColor(33, 37, 41);
      pdf.text('Weekly Project Summary', margin, margin + 6);
      pdf.setFontSize(10);
      pdf.setTextColor(90, 90, 90);
      pdf.text(
        `Project: ${projectFilter || 'All Projects'}    Date range: ${dateRangeFilter ||
          'Not selected'}    Generated: ${dateStr}`,
        margin,
        margin + 13,
      );
      let y = margin + 20;

      // Capture section by section from the live page, so canvas charts keep their drawing
      for (let index = 0; index < sectionElements.length; index += 1) {
        const sectionElement = sectionElements[index];
        const title = sectionElement.dataset.pdfTitle || '';
        const sectionContent = sectionElement.querySelector('[data-pdf-content]');
        if (sectionContent) {
          // eslint-disable-next-line no-await-in-loop
          const canvas = await captureElement(sectionContent);
          if (canvas?.width && canvas?.height) {
            y = addSectionToPdf(pdf, title, canvas, y);
          }
        }
      }

      // Generate filename with project and date range
      const projectName = projectFilter || 'All-Projects';
      const dateRange = dateRangeFilter
        ? dateRangeFilter.replaceAll(/\s+/g, '-').replaceAll(/,/g, '')
        : dateStr;
      pdf.save(`weekly-project-summary-${projectName}-${dateRange}.pdf`);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success('PDF generated and downloaded successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', err);
      toast.dismiss(loadingToastId);
      toast.error(
        err?.message ||
          'Failed to generate PDF. Please try again or contact support if the issue persists.',
        {
          position: 'top-right',
          autoClose: 5000,
        },
      );
    } finally {
      setOpenSections(currentOpenSections);
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`weekly-project-summary-container ${styles.weeklyProjectSummaryContainer} ${
        darkMode ? styles.darkMode : ''
      } ${darkMode ? 'dark-mode' : ''}`}
      data-testid="weekly-project-summary-container"
    >
      <WeeklyProjectSummaryHeader
        handleSaveAsPDF={handleSaveAsPDF}
        isGeneratingPDF={isGeneratingPDF}
      />
      <div className={`${styles.weeklyProjectSummaryDashboardContainer}`}>
        {isGeneratingPDF === false && (
          <div className={styles.cardSelectorBar}>
            <CardSelector
              cards={sections.map(({ key, title }) => ({ key, title }))}
              visibleKeys={visibleKeys}
              cardLimit={cardLimit}
              shownCount={visibleSections.length}
              onChange={handleCardsChange}
              darkMode={darkMode}
            />
          </div>
        )}
        {visibleSections.length === 0 && (
          <p className={styles.noCardsMessage}>
            No cards selected. Use Customize Cards to choose which cards to show.
          </p>
        )}
        <div className={`${styles.weeklyProjectSummaryDashboardGrid}`}>
          {visibleSections.map(({ title, key, className, content }) => (
            <div
              key={key}
              className={`${styles.weeklyProjectSummaryDashboardSection} ${styles[className]}`}
              data-pdf-section={key}
              data-pdf-title={title}
            >
              <button
                type="button"
                className={styles.weeklyProjectSummaryDashboardCategoryTitle}
                onClick={() => toggleSection(key)}
              >
                {title} <span>{openSections[key] ? '∧' : '∨'}</span>
              </button>
              {openSections[key] && (
                <div
                  className={`${styles.weeklyProjectSummaryDashboardCategoryContent}`}
                  data-pdf-content
                >
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
