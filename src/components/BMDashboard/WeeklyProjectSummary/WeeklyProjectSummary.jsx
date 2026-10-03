// --- WeeklyProjectSummary.jsx ---
/* eslint-disable import/no-unresolved */
import { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import WeeklyProjectSummaryHeader from './WeeklyProjectSummaryHeader';
import PaidLaborCost from './PaidLaborCost/PaidLaborCost';
import { fetchAllMaterials } from '../../../actions/bmdashboard/materialsActions';
import { fetchBMProjects } from '../../../actions/bmdashboard/projectActions';
import IssuesCharts from '../Issues/LongestOpenIssuesChart';
import { MaterialConsumptionCards } from './MaterialConsumption/MaterialConsumption';
import ProjectRiskProfileOverview from './ProjectRiskProfileOverview';
import IssuesBreakdownChart from './IssuesBreakdownChart';
import InjuryCategoryBarChart from './GroupedBarGraphInjurySeverity/InjuryCategoryBarChart';
import ToolsHorizontalBarChart from './Tools/ToolsHorizontalBarChart';
import ExpenseBarChart from './Financials/ExpenseBarChart';
import CostVarianceTrendGraph from './Financials/CostVarianceTrendGraph';
import CostBreakDown from './Financials/CostBreakDown/CostBreakDown';
import InteractiveMap from '../InteractiveMap/InteractiveMap';
import LossTrackingLineChart from './Financials/LossTrackingLineCharts/LossTrackingLineChart';
import MostFrequentKeywords from './MostFrequentKeywords/MostFrequentKeywords';
import LessonsLearntChart from '../LessonsLearnt/LessonsLearntChart';
import DistributionLaborHours from './DistributionLaborHours/DistributionLaborHours';
import FinancialsTrackingSection from './ExpenditureChart/FinancialsTrackingSection';
import ToolsStoppageHorizontalBarChart from './Tools/ToolsStoppageHorizontalBarChart/ToolsStoppageHorizontalBarChart';
import SupplierPerformanceGraph from './SupplierPerformanceGraph';
import ToolStatusDonutChart from './ToolStatusDonutChart/ToolStatusDonutChart';
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
  const containerRef = useRef(null);

  const materials = useSelector(state => state.materials?.materialslist || []);
  const bmProjects = useSelector(state => state.bmProjects || []);
  const darkMode = useSelector(state => state.theme.darkMode);
  const projectFilter = useSelector(state => state.weeklyProjectSummary?.projectFilter || '');
  const dateRangeFilter = useSelector(state => state.weeklyProjectSummary?.dateRangeFilter || '');
  const comparisonPeriodFilter = useSelector(
    state => state.weeklyProjectSummary?.comparisonPeriodFilter || '',
  );

  const [openSections, setOpenSections] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [compareWithPreviousWeek, setCompareWithPreviousWeek] = useState(false);

  const selectedProjectLabel = projectFilter || 'One Community';
  const selectedDateRangeLabel = dateRangeFilter || 'Latest completed week';
  const selectedComparisonRangeLabel = comparisonPeriodFilter || 'Previous week';

  useEffect(() => {
    if (materials.length === 0) dispatch(fetchAllMaterials());
    if (bmProjects.length === 0) dispatch(fetchBMProjects());
  }, [dispatch, materials.length, bmProjects.length]);

  useEffect(() => {
    setIsRefreshing(true);

    const refreshTimer = setTimeout(() => {
      setIsRefreshing(false);
    }, 400);

    return () => clearTimeout(refreshTimer);
  }, [projectFilter, dateRangeFilter, comparisonPeriodFilter]);

  const quantityOfMaterialsUsedData = useMemo(() => {
    if (!materials.length) return [];

    return Array.from(new Map(materials.map(material => [material._id, material])).values());
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
        badgeLabel: 'Risk',
        hasData: true,
        emptyMessage: 'No risk profile data for this week.',
        comparisonText: `Risk profile: comparison period is ${selectedComparisonRangeLabel}.`,
        content: <ProjectRiskProfileOverview />,
      },
      {
        title: 'Project Status',
        key: 'Project Status',
        className: 'full',
        // Static word badge, matching every other placeholder section below: these mock
        // cards don't come from real per-week data yet, so a bare count of them would
        // misrepresent itself as a data-driven figure (this is what reviewers flagged).
        badgeLabel: 'Status',
        hasData: projectStatusButtons.length > 0,
        emptyMessage: 'No project status data for this week.',
        comparisonText: `Project status: comparison period is ${selectedComparisonRangeLabel}.`,
        content: (
          <div className={styles.projectStatusGrid}>
            {projectStatusButtons.map((button, index) => (
              <div
                key={`${button.title}-${index}`}
                className={`${styles.weeklyProjectSummaryCard} ${styles.statusCard}`}
                style={{ backgroundColor: button.bgColor }}
              >
                <div className={styles.weeklyCardTitle}>{button.title}</div>
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
        badgeLabel: 'Issues',
        hasData: true,
        emptyMessage: 'No issues found for this week.',
        comparisonText: `Issues: comparison period is ${selectedComparisonRangeLabel}.`,
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
        hasData: true,
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
        badgeLabel: `${quantityOfMaterialsUsedData.length}`,
        hasData: quantityOfMaterialsUsedData.length > 0,
        emptyMessage: 'No material consumption data for this week.',
        comparisonText: `Material consumption: comparison period is ${selectedComparisonRangeLabel}.`,
        // Shared with /bmdashboard/issuechart so the PR-required three-card grouping stays in sync.
        content: (
          <MaterialConsumptionCards quantityOfMaterialsUsedData={quantityOfMaterialsUsedData} />
        ),
      },
      {
        title: 'Issue Tracking',
        key: 'Issue Tracking',
        className: 'small',
        badgeLabel: 'Open',
        hasData: true,
        emptyMessage: 'No issue tracking data for this week.',
        comparisonText: `Issue tracking: comparison period is ${selectedComparisonRangeLabel}.`,
        content: (
          <div className={`${styles.weeklyProjectSummaryCard} ${styles.normalCard}`}>
            <IssuesCharts bmProjects={bmProjects} />
          </div>
        ),
      },
      {
        title: 'Tools and Equipment Tracking',
        key: 'Tools and Equipment Tracking',
        className: 'half',
        badgeLabel: 'Tools',
        hasData: true,
        emptyMessage: 'No tools or equipment data for this week.',
        comparisonText: `Tools and equipment: comparison period is ${selectedComparisonRangeLabel}.`,
        content: (
          <>
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
        className: 'full',
        badgeLabel: 'Lessons',
        hasData: true,
        emptyMessage: 'No lessons learned data for this week.',
        comparisonText: `Lessons learned: comparison period is ${selectedComparisonRangeLabel}.`,
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
        badgeLabel: 'Costs',
        hasData: true,
        emptyMessage: 'No financial data for this week.',
        comparisonText: `Financials: comparison period is ${selectedComparisonRangeLabel}.`,
        content: (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              width: '100%',
            }}
          >
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
        badgeLabel: 'Loss',
        hasData: true,
        emptyMessage: 'No loss tracking data for this week.',
        comparisonText: `Loss tracking: comparison period is ${selectedComparisonRangeLabel}.`,
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
        badgeLabel: 'Map',
        hasData: true,
        emptyMessage: 'No global distribution data for this week.',
        comparisonText: `Global distribution: comparison period is ${selectedComparisonRangeLabel}.`,
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
        className: 'full',
        badgeLabel: 'Labor',
        hasData: true,
        emptyMessage: 'No labor or time tracking data for this week.',
        comparisonText: `Labor and time: comparison period is ${selectedComparisonRangeLabel}.`,
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
        title: 'Financials Tracking',
        key: 'Financials Tracking',
        className: 'full',
        badgeLabel: 'Tracking',
        hasData: true,
        emptyMessage: 'No financial tracking data for this week.',
        comparisonText: `Financials tracking: comparison period is ${selectedComparisonRangeLabel}.`,
        content: (
          // FinancialsTrackingSection already renders its own CostPredictionChart and
          // ActualVsPlannedCost internally; rendering them again here duplicated both
          // charts on the page.
          <div style={{ gridColumn: '1 / -1', width: '100%' }}>
            <FinancialsTrackingSection />
          </div>
        ),
      },
    ],
    [darkMode, bmProjects, quantityOfMaterialsUsedData, selectedComparisonRangeLabel],
  );

  const expandAllSections = () => {
    const allSectionsOpen = {};

    sections.forEach(section => {
      allSectionsOpen[section.key] = true;
    });

    setOpenSections(allSectionsOpen);
  };

  const collapseAllSections = () => {
    setOpenSections({});
  };

  const areAllSectionsOpen = sections.every(section => openSections[section.key]);
  const areAllSectionsClosed = sections.every(section => !openSections[section.key]);

  const handleSaveAsPDF = async () => {
    if (isGeneratingPDF) {
      return;
    }

    const currentOpenSections = { ...openSections };
    setIsGeneratingPDF(true);

    const loadingToastId = toast.info('Generating PDF...', {
      position: 'top-right',
      autoClose: false,
      closeOnClick: false,
      pauseOnHover: false,
    });

    try {
      const allSectionsOpen = {};

      sections.forEach(section => {
        allSectionsOpen[section.key] = true;
      });

      setOpenSections(allSectionsOpen);

      // Force-opening every section mounts ~13 sections' worth of charts at once, each
      // fetching its own data — a fixed short delay isn't enough for all of them to finish,
      // so the export can capture mid-flight "Loading..." placeholders instead of charts.
      // Poll until none remain visible (or we hit a reasonable cap) before cloning.
      await new Promise(resolve => setTimeout(resolve, 500));

      const contentElement =
        containerRef.current || document.querySelector(`.${styles.weeklyProjectSummaryContainer}`);

      if (!contentElement) {
        throw new Error(
          'Weekly project summary container not found. Please refresh the page and try again.',
        );
      }

      const waitStart = Date.now();
      const maxWaitMs = 15000;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const stillLoading = Array.from(contentElement.querySelectorAll('*')).some(
          el => el.children.length === 0 && el.textContent.trim() === 'Loading...',
        );
        if (!stillLoading || Date.now() - waitStart > maxWaitMs) break;
        // eslint-disable-next-line no-await-in-loop
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Several charts (e.g. Material Consumption) show no "Loading..." text at all — they
      // just render empty until their data arrives, so the poll above can't see them. Give
      // those a further settle window to finish fetching and painting before capture.
      await new Promise(resolve => setTimeout(resolve, 2500));

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

      const clonedContent = contentElement.cloneNode(true);

      // Section headings are interactive <button> elements (for expand/collapse), but the
      // cleanup below strips every <button> from the clone. Swap each heading for a plain,
      // noninteractive element carrying just its title text first, so the export keeps its
      // section labels instead of losing all of them to the generic button removal.
      clonedContent
        .querySelectorAll(`.${styles.weeklyProjectSummaryDashboardCategoryTitle}`)
        .forEach(headerButton => {
          const titleText =
            headerButton.querySelector(`.${styles.sectionTitleText}`)?.textContent ?? '';
          const replacement = document.createElement('div');
          replacement.className = headerButton.className;
          replacement.textContent = titleText;
          headerButton.replaceWith(replacement);
        });

      clonedContent
        .querySelectorAll(
          'button, .weekly-project-summary-dropdown-icon, .no-print, .weekly-summary-header-controls',
        )
        .forEach(el => {
          el.remove();
        });

      // .sectionContentWrapper uses display:contents so its children stay direct CSS Grid
      // items on screen (see WeeklyProjectSummary.module.css), but html2canvas cannot
      // compute a layout box for display:contents elements and silently fails to render
      // anything inside them. The clone is a one-off flattened snapshot, not a live grid,
      // so switching it to display:block here is safe and makes the chart content visible.
      clonedContent.querySelectorAll(`.${styles.sectionContentWrapper}`).forEach(wrapper => {
        wrapper.style.display = 'block';
      });

      // html2canvas cannot reliably rasterize live <svg> trees — recharts/d3 charts rely on
      // transforms and clip-paths it doesn't render correctly, so chart areas come out blank
      // even though the cloned markup is present. Work around this by rendering each chart
      // SVG (from the still-live, already-correctly-rendered original) to a canvas and
      // swapping the cloned <svg> for that rasterized <img>, which html2canvas handles fine.
      const liveSvgs = Array.from(contentElement.querySelectorAll('svg'));
      const clonedSvgs = Array.from(clonedContent.querySelectorAll('svg'));

      await Promise.all(
        clonedSvgs.map(async (clonedSvg, index) => {
          const liveSvg = liveSvgs[index];
          if (!liveSvg) return;

          const width = liveSvg.clientWidth || Number(liveSvg.getAttribute('width')) || 0;
          const height = liveSvg.clientHeight || Number(liveSvg.getAttribute('height')) || 0;
          if (width < 20 || height < 20) return;

          const svgClone = liveSvg.cloneNode(true);
          svgClone.setAttribute('width', width);
          svgClone.setAttribute('height', height);
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

          const svgString = new XMLSerializer().serializeToString(svgClone);
          const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

          await new Promise(resolve => {
            const rasterImg = new Image();
            rasterImg.onload = () => {
              const rasterCanvas = document.createElement('canvas');
              rasterCanvas.width = width * 2;
              rasterCanvas.height = height * 2;
              const rasterCtx = rasterCanvas.getContext('2d');
              rasterCtx.drawImage(rasterImg, 0, 0, rasterCanvas.width, rasterCanvas.height);

              const pngImg = document.createElement('img');
              pngImg.src = rasterCanvas.toDataURL('image/png');
              pngImg.style.width = `${width}px`;
              pngImg.style.height = `${height}px`;
              clonedSvg.replaceWith(pngImg);
              resolve();
            };
            rasterImg.onerror = resolve;
            rasterImg.src = svgDataUrl;
          });
        }),
      );

      // cloneNode never copies a <canvas>'s drawn pixels, only the empty element, so
      // Chart.js-based charts would be blank too. Replace each cloned canvas with an <img>
      // of the live canvas's already-rendered content.
      const liveCanvases = Array.from(contentElement.querySelectorAll('canvas'));
      const clonedCanvases = Array.from(clonedContent.querySelectorAll('canvas'));

      clonedCanvases.forEach((clonedCanvas, index) => {
        const liveCanvas = liveCanvases[index];
        if (!liveCanvas || liveCanvas.width === 0 || liveCanvas.height === 0) return;

        const pngImg = document.createElement('img');
        pngImg.src = liveCanvas.toDataURL('image/png');
        pngImg.style.width = `${liveCanvas.clientWidth || liveCanvas.width}px`;
        pngImg.style.height = `${liveCanvas.clientHeight || liveCanvas.height}px`;
        clonedCanvas.replaceWith(pngImg);
      });

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

      await new Promise(resolve => setTimeout(resolve, 300));

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

      const pdfWidth = 210;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, imgHeight],
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);

      const projectName = selectedProjectLabel.replaceAll(/\s+/g, '-');
      const dateRange = selectedDateRangeLabel.replaceAll(/\s+/g, '-').replaceAll(',', '');
      const fileName = `weekly-project-summary-${projectName}-${dateRange}.pdf`;

      pdf.save(fileName);

      if (document.body.contains(pdfContainer)) {
        pdfContainer.remove();
      }

      toast.update(loadingToastId, {
        render: 'PDF generated and downloaded successfully!',
        type: 'success',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', err);

      const errorMessage =
        err?.message ||
        'Failed to generate PDF. Please try again or contact support if the issue persists.';

      toast.update(loadingToastId, {
        render: errorMessage,
        type: 'error',
        autoClose: 5000,
        closeOnClick: true,
        pauseOnHover: true,
      });

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
        bmProjects={bmProjects}
      />

      <div className={`${styles.weeklySummaryControls} no-print`}>
        <div className={styles.activeSummaryBanner}>
          <span className={styles.activeSummaryLabel}>Showing summary for:</span>
          <span className={styles.activeSummaryValue}>
            {selectedProjectLabel} | {selectedDateRangeLabel}
          </span>
        </div>

        <div className={styles.weeklySummaryActionRow}>
          <label className={styles.compareToggle}>
            <input
              type="checkbox"
              checked={compareWithPreviousWeek}
              onChange={event => setCompareWithPreviousWeek(event.target.checked)}
            />
            <span>Compare with Previous Week</span>
          </label>

          <div className={styles.expandCollapseControls}>
            <button type="button" onClick={expandAllSections} disabled={areAllSectionsOpen}>
              Expand All
            </button>
            <button type="button" onClick={collapseAllSections} disabled={areAllSectionsClosed}>
              Collapse All
            </button>
          </div>
        </div>

        {isRefreshing && <div className={styles.loadingBanner}>Updating weekly summary...</div>}
      </div>

      <div className={styles.weeklyProjectSummaryDashboardContainer}>
        <div className={styles.weeklyProjectSummaryDashboardGrid}>
          {sections.map(
            ({
              title,
              key,
              className,
              content,
              badgeLabel,
              hasData,
              emptyMessage,
              comparisonText,
            }) => (
              <div
                key={key}
                className={`${styles.weeklyProjectSummaryDashboardSection} ${styles[className]}`}
              >
                <button
                  type="button"
                  className={styles.weeklyProjectSummaryDashboardCategoryTitle}
                  onClick={() => toggleSection(key)}
                  aria-expanded={Boolean(openSections[key])}
                >
                  <span className={styles.sectionTitleText}>{title}</span>

                  <span className={styles.sectionHeaderMeta}>
                    {badgeLabel && <span className={styles.sectionBadge}>{badgeLabel}</span>}
                    <span>{openSections[key] ? '∧' : '∨'}</span>
                  </span>
                </button>

                {openSections[key] && (
                  <div className={styles.weeklyProjectSummaryDashboardCategoryContent}>
                    {compareWithPreviousWeek && comparisonText && (
                      <div className={`${styles.comparisonBanner} no-print`}>{comparisonText}</div>
                    )}

                    {hasData ? (
                      <div className={styles.sectionContentWrapper}>{content}</div>
                    ) : (
                      <div className={styles.emptySectionMessage}>
                        {emptyMessage || 'No data for this week.'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default WeeklyProjectSummary;
