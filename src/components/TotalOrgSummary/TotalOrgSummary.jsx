/* eslint-disable testing-library/no-node-access */
import { connect } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Col,
  Container,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from 'reactstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'moment-timezone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import hasPermission from '~/utils/permissions';

// actions
import { getTotalOrgSummary, getTaskAndProjectStats } from '~/actions/totalOrgSummary';

import '../Header/index.css';
import styles from './TotalOrgSummary.module.css';
import { clsx } from 'clsx';
import VolunteerHoursDistribution from './VolunteerHoursDistribution/VolunteerHoursDistribution';
import AccordianWrapper from './AccordianWrapper/AccordianWrapper';
import VolunteerStatus from './VolunteerStatus/VolunteerStatus';
import VolunteerActivities from './VolunteerActivities/VolunteerActivities';
import VolunteerStatusChart from './VolunteerStatus/VolunteerStatusChart';
import BlueSquareStats from './BlueSquareStats/BlueSquareStats';
import TeamStats from './TeamStats/TeamStats';
import HoursCompletedBarChart from './HoursCompleted/HoursCompletedBarChart';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';
import AnniversaryCelebrated from './AnniversaryCelebrated/AnniversaryCelebrated';
import RoleDistributionPieChart from './VolunteerRolesTeamDynamics/RoleDistributionPieChart';
import WorkDistributionBarChart from './VolunteerRolesTeamDynamics/WorkDistributionBarChart';
import VolunteerTrendsLineChart from './VolunteerTrendsLineChart/VolunteerTrendsLineChart';
import GlobalVolunteerMap from './GlobalVolunteerMap/GlobalVolunteerMap';
import TaskCompletedBarChart from './TaskCompleted/TaskCompletedBarChart';

function calculateStartDate() {
  // returns a string date in YYYY-MM-DD format of the start of the previous week
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 7);
  return currentDate.toISOString().split('T')[0];
}

function calculateEndDate() {
  // returns a string date in YYYY-MM-DD format of the end of the previous week
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

function calculateComparisonDates(comparisonType, fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (comparisonType) {
    case 'Week Over Week':
      return {
        comparisonStartDate: new Date(start.setDate(start.getDate() - diffDays))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setDate(end.getDate() - diffDays))
          .toISOString()
          .split('T')[0],
      };
    case 'Month Over Month':
      return {
        comparisonStartDate: new Date(start.setMonth(start.getMonth() - 1))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setMonth(end.getMonth() - 1)).toISOString().split('T')[0],
      };
    case 'Year Over Year':
      return {
        comparisonStartDate: new Date(start.setFullYear(start.getFullYear() - 1))
          .toISOString()
          .split('T')[0],
        comparisonEndDate: new Date(end.setFullYear(end.getFullYear() - 1))
          .toISOString()
          .split('T')[0],
      };
    default:
      return {
        comparisonStartDate: null,
        comparisonEndDate: null,
      };
  }
}

const fromDate = calculateStartDate();
const toDate = calculateEndDate();

function TotalOrgSummary(props) {
  const { darkMode, error } = props;
  const [isVolunteerFetchingError, setIsVolunteerFetchingError] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRangeDropdownOpen, setDateRangeDropdownOpen] = useState(false);
  const [comparisonDropdownOpen, setComparisonDropdownOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Current Week');
  const [selectedComparison, setSelectedComparison] = useState('No Comparison');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentFromDate, setCurrentFromDate] = useState(fromDate);
  const [currentToDate, setCurrentToDate] = useState(toDate);
  const rootRef = useRef(null);

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
        setIsLoading(true);
        const { comparisonStartDate, comparisonEndDate } = calculateComparisonDates(
          selectedComparison,
          currentFromDate,
          currentToDate,
        );

        const volunteerStatsResponse = await props.getTotalOrgSummary(
          currentFromDate,
          currentToDate,
          comparisonStartDate,
          comparisonEndDate,
        );

        // Fetch task and project stats separately
        const taskAndProjectStatsResponse = await props.getTaskAndProjectStats(
          currentFromDate,
          currentToDate,
        );

        setVolunteerStats({
          ...volunteerStatsResponse.data,
          taskAndProjectStats: taskAndProjectStatsResponse,
        });
        await props.hasPermission('');
        setIsLoading(false);
      } catch (catchFetchError) {
        setIsVolunteerFetchingError(true);
      }
    };

    fetchVolunteerStats();
  }, [currentFromDate, currentToDate, selectedComparison]);

  const handleSaveAsPDF = async () => {
    if (isGeneratingPDF) return;

    setIsGeneratingPDF(true);

    try {
      // Ensure required libraries are present.
      if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
        // eslint-disable-next-line no-alert
        alert('Required PDF libraries not loaded. Please refresh the page.');
        return;
      }

      // Ensure data is ready.
      if (!volunteerStats || isLoading) {
        // eslint-disable-next-line no-alert
        alert('Please wait for data to load before generating PDF.');
        return;
      }

      // 2. Wait longer for charts/maps to render (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));

      // 3. Replace Chart.js canvas elements with images in the live DOM.
      const chartCanvases = document.querySelectorAll(
        '[data-chart="volunteer-status"] canvas, [data-chart="mentor-status"] canvas',
      );
      const originalCanvases = [];
      chartCanvases.forEach(canvasElem => {
        try {
          const img = document.createElement('img');
          img.src = canvasElem.toDataURL('image/png');
          img.width = canvasElem.width;
          img.height = canvasElem.height;
          img.style.cssText = canvasElem.style.cssText;
          originalCanvases.push({
            canvas: canvasElem,
            parent: canvasElem.parentNode,
          });
          canvasElem.parentNode.replaceChild(img, canvasElem);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error converting canvas to image:', err);
        }
      });

      // 4. Create a temporary container for PDF generation
      const pdfContainer = document.createElement('div');
      pdfContainer.id = 'pdf-export-container';
      pdfContainer.style.width = '100%';
      pdfContainer.style.padding = '0';
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.zIndex = '9999';
      pdfContainer.style.boxSizing = 'border-box';
      pdfContainer.style.minHeight = '100%';
      pdfContainer.style.margin = '0';

      // Clone the main content area

      const originalContent = rootRef.current;
      const clonedContent = originalContent.cloneNode(true);

      // Remove interactive or unwanted elements from the clone

      // Remove interactive or unwanted elements from the clone
      clonedContent
        .querySelectorAll('[data-pdf-hide], .controls, .no-print')
        .forEach(el => el.remove());

      // Remove all collapsed AccordianWrapper (Collapsible) sections from the PDF
      clonedContent.querySelectorAll('.Collapsible').forEach(collapsible => {
        // If it does NOT have the 'is-open' class, it's collapsed
        const trigger = collapsible.querySelector('.Collapsible__trigger');
        if (!trigger || !trigger.classList.contains('is-open')) {
          collapsible.remove();
        }
      });

      // Copy canvas bitmap from live DOM to cloned DOM before converting to image
      // This includes Chart.js, Leaflet, and heatmap overlays
      const liveCanvases = Array.from(document.querySelectorAll('canvas'));
      const clonedCanvases = Array.from(clonedContent.querySelectorAll('canvas'));
      clonedCanvases.forEach(clonedCanvas => {
        try {
          // Try to find a matching live canvas by size and position
          const match = liveCanvases.find(
            liveCanvas =>
              liveCanvas.width === clonedCanvas.width &&
              liveCanvas.height === clonedCanvas.height &&
              liveCanvas.parentNode?.className === clonedCanvas.parentNode?.className,
          );
          if (match) {
            const ctx = clonedCanvas.getContext('2d');
            ctx.clearRect(0, 0, clonedCanvas.width, clonedCanvas.height);
            ctx.drawImage(match, 0, 0);
          }
          // Now convert to image if canvas has content
          if (clonedCanvas.width > 0 && clonedCanvas.height > 0) {
            const img = document.createElement('img');
            img.src = clonedCanvas.toDataURL('image/png');
            img.width = clonedCanvas.width;
            img.height = clonedCanvas.height;
            img.style.cssText = clonedCanvas.style.cssText;
            clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
          }
        } catch (err) {
          /* ignore */
        }
      });

      // Adjust title row styling for a clean layout
      const titleRow = clonedContent.querySelector('[data-pdf-title-row]');
      if (titleRow) {
        const titleCol = titleRow.querySelector('[data-pdf-title-col]');
        if (titleCol) {
          titleCol.style.width = '100%';
        }
        const mainTitle = titleRow.querySelector('h3');
        if (mainTitle) {
          mainTitle.style.fontSize = '24pt';
          mainTitle.style.fontWeight = 'bold';
          mainTitle.style.textAlign = 'left';
          mainTitle.style.color = '#000';
          mainTitle.style.margin = '0';
        }
      }

      // Create a style element for the PDF container
      const styleElem = document.createElement('style');
      styleElem.textContent = `
        [data-pdf-root] {
          padding: 20px !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          width: 100% !important;
          min-height: 100% !important;
        }

        [data-pdf-title-row] {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 20px !important;
          width: 100% !important;
          padding: 0 !important;
        }

        /* PDF block container: border and shadow, dark mode fidelity */
        [data-pdf-block] {
          page-break-inside: avoid;
          break-inside: avoid;
          margin: 15px 0 !important;
          padding: 20px !important;
          background-color: ${darkMode ? '#1C2541' : '#fff'} !important;
          border: 1px solid ${darkMode ? '#3a3a3a' : '#e0e0e0'} !important;
          border-radius: 10px !important;
          box-shadow: ${
            darkMode
              ? '0 2px 12px 0 rgba(255,255,255,0.18), 0 1.5px 8px 0 rgba(255,255,255,0.10)'
              : '0 2px 4px rgba(0, 0, 0, 0.08)'
          } !important;
          overflow: hidden !important;
        }

        img, svg {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid !important;
        }

        .recharts-wrapper {
          width: 100% !important;
          height: auto !important;
        }

        table {
          page-break-inside: avoid !important;
        }

        .Collapsible__trigger {
          background-color: ${darkMode ? '#1C2541' : '#fff'} !important;
          color: ${darkMode ? '#fff' : '#000'} !important;
        }

        .volunteerStatusGrid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
          gap: 1.5rem !important;
          width: 100% !important;
          margin-top: 15px !important;
        }

        .component-pie-chart-label {
          font-size: 12px !important;
          font-weight: 600 !important;
          color: #000 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        [data-pdf-title] p {
          font-size: 1.5em !important;
          font-weight: bold !important;
          text-align: center !important;
          margin: 10px !important;
          color: #333 !important;
        }

        /* Force all chart and card titles to white in dark mode for PDF */
${
  darkMode
    ? `
  .componentContainer h1,
  .componentContainer h2,
  .componentContainer h3,
  .componentContainer h4,
  .componentContainer h5,
  .componentContainer h6,
  .componentContainer p,
  .componentContainer .totalOrgChartTitle,
  .componentContainer .volunteerStatusGrid h3,
  .componentContainer .card-title,
  .componentContainer .statistics-title,
  .componentContainer .Collapsible__trigger,
  .componentContainer .volunteer-status-header,
  .componentContainer .volunteer-status-title {
    color: #fff !important;
    text-shadow: 0 1px 4px #000, 0 0 2px #000 !important;
  }
  .componentContainer [data-pdf-title] p {
    color: #fff !important;
    text-shadow: 0 1px 4px #000, 0 0 2px #000 !important;
  }
  .componentContainer [data-pdf-title] {
    color: #fff !important;
    text-shadow: 0 1px 4px #000, 0 0 2px #000 !important;
  }
`
    : ''
}
      `;

      // Add content to the PDF container
      pdfContainer.appendChild(styleElem);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      // 5. Use html2canvas to capture the rendered container
      const screenshotCanvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
      });

      if (!screenshotCanvas) {
        throw new Error('html2canvas failed to capture the content.');
      }

      const imgData = screenshotCanvas.toDataURL('image/png');
      if (!imgData || imgData.length < 100) {
        throw new Error('Invalid image data generated.');
      }

      // 6. Create a single-page PDF
      const pdfWidth = 210; // A4 width in mm
      const imgHeight = (screenshotCanvas.height * pdfWidth) / screenshotCanvas.width;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, imgHeight],
      });
      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      const now = new Date();
      const localDate = now.toLocaleDateString('en-CA'); // Using YYYY-MM-DD format
      doc.save(`volunteer-report-${localDate}.pdf`);

      // Cleanup: restore original canvases and remove temporary container
      originalCanvases.forEach(({ canvas, parent }) => {
        const img = parent.querySelector('img');
        if (img) {
          parent.replaceChild(canvas, img);
        }
      });
      document.body.removeChild(pdfContainer);
    } catch (pdfError) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed:', pdfError);
      // eslint-disable-next-line no-alert
      alert(`Error generating PDF: ${pdfError.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleDateRangeSelect = option => {
    if (option === 'Select Date Range') {
      setShowDatePicker(true);
    } else {
      setSelectedDateRange(option);
      setShowDatePicker(false);
      setSelectedComparison('No Comparison');

      if (option === 'Current Week') {
        setCurrentFromDate(fromDate);
        setCurrentToDate(toDate);
      } else if (option === 'Previous Week') {
        const prevWeekStart = new Date(fromDate);
        const prevWeekEnd = new Date(toDate);
        prevWeekStart.setDate(prevWeekStart.getDate() - 7);
        prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
        setCurrentFromDate(prevWeekStart.toISOString().split('T')[0]);
        setCurrentToDate(prevWeekEnd.toISOString().split('T')[0]);
      }
    }
  };

  const handleDatePickerSubmit = () => {
    if (startDate && endDate) {
      setSelectedDateRange(`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`);
      setShowDatePicker(false);
      setSelectedComparison('No Comparison');

      setCurrentFromDate(startDate.toISOString().split('T')[0]);
      setCurrentToDate(endDate.toISOString().split('T')[0]);
    }
  };

  if (error || isVolunteerFetchingError) {
    return (
      <Container
        className={clsx(
          styles.containerTotalOrgWrapper,
          darkMode && 'bg-oxford-blue', // keep global theme utility if needed
        )}
      >
        <Row
          className="align-self-center pt-2"
          data-testid="error"
          style={{ width: '30%', margin: '0 auto' }}
        >
          <Col>
            <Alert color="danger">Error! {error?.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className={clsx(
        styles.containerTotalOrgWrapper,
        'py-3 mb-5',
        darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke', // or add .whiteSmoke
      )}
    >
      <div ref={rootRef} data-pdf-root>
        <Row className={styles.totalOrgReportHeaderRow} data-pdf-title-row>
          <div className={styles.reportHeaderTitle} data-pdf-title-col>
            <h3 className="my-0">Total Org Summary</h3>
          </div>
          <div className={styles.reportHeaderActions}>
            <Dropdown
              isOpen={dateRangeDropdownOpen}
              toggle={() => setDateRangeDropdownOpen(!dateRangeDropdownOpen)}
            >
              <DropdownToggle caret>{selectedDateRange}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => handleDateRangeSelect('Current Week')}>
                  Current Week
                </DropdownItem>
                <DropdownItem onClick={() => handleDateRangeSelect('Previous Week')}>
                  Previous Week
                </DropdownItem>
                <DropdownItem onClick={() => handleDateRangeSelect('Select Date Range')}>
                  Select Date Range
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown
              isOpen={comparisonDropdownOpen}
              toggle={() => setComparisonDropdownOpen(!comparisonDropdownOpen)}
            >
              <DropdownToggle caret>{selectedComparison}</DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => setSelectedComparison('No Comparison')}>
                  No Comparison
                </DropdownItem>
                <DropdownItem onClick={() => setSelectedComparison('Week Over Week')}>
                  Week Over Week
                </DropdownItem>
                <DropdownItem onClick={() => setSelectedComparison('Month Over Month')}>
                  Month Over Month
                </DropdownItem>
                <DropdownItem onClick={() => setSelectedComparison('Year Over Year')}>
                  Year Over Year
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              className={styles.sharePdfBtn}
              data-pdf-hide
              onClick={handleSaveAsPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Save as PDF'}
            </Button>
          </div>
        </Row>

        <Modal isOpen={showDatePicker} toggle={() => setShowDatePicker(!showDatePicker)}>
          <ModalHeader toggle={() => setShowDatePicker(!showDatePicker)}>
            Select Date Range
          </ModalHeader>
          <ModalBody>
            <div className="d-flex flex-column gap-4">
              <div>
                <label htmlFor="start-date" style={{ display: 'block', marginBottom: '1rem' }}>
                  Start Date
                </label>
                <div style={{ padding: '0.5rem 0' }}>
                  <DatePicker
                    id="start-date"
                    selected={startDate}
                    onChange={date => setStartDate(date)}
                    className="form-control"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select start date"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="end-date" style={{ display: 'block', marginBottom: '1rem' }}>
                  End Date
                </label>
                <div style={{ padding: '0.5rem 0' }}>
                  <DatePicker
                    id="end-date"
                    selected={endDate}
                    onChange={date => setEndDate(date)}
                    className="form-control"
                    dateFormat="MM/dd/yyyy"
                    placeholderText="Select end date"
                    minDate={startDate}
                  />
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setShowDatePicker(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={handleDatePickerSubmit}
              disabled={!startDate || !endDate}
            >
              Apply
            </Button>
          </ModalFooter>
        </Modal>

        <hr />
        <AccordianWrapper title="Volunteer Status">
          <Row>
            <Col lg={{ size: 12 }}>
              <VolunteerStatus
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                totalHoursWorked={volunteerStats?.totalHoursWorked}
                comparisonType={selectedComparison}
              />
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Volunteer Activities">
          <Row>
            <Col lg={{ size: 12 }}>
              <VolunteerActivities
                isLoading={isLoading}
                totalSummariesSubmitted={volunteerStats?.totalSummariesSubmitted}
                completedAssignedHours={volunteerStats?.completedAssignedHours}
                totalBadgesAwarded={volunteerStats?.totalBadgesAwarded}
                tasksStats={volunteerStats?.tasksStats}
                totalActiveTeams={volunteerStats?.totalActiveTeams}
                comparisonType={selectedComparison}
              />
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Global Distribution and Volunteer Status Overview">
          <Row>
            <Col lg={{ size: 6 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Global Volunteer Network: Uniting Communities Worldwide</p>
                </div>
                <GlobalVolunteerMap
                  isLoading={isLoading}
                  locations={volunteerStats?.userLocations}
                />
              </div>
            </Col>
            <Col lg={{ size: 6 }}>
              <div
                className={clsx(
                  styles.componentContainer,
                  styles.componentBorder,
                  styles.componentBorderLoose,
                )}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Volunteer Status</p>
                </div>
                <VolunteerStatusChart
                  isLoading={isLoading}
                  volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                  mentorNumberStats={volunteerStats?.mentorNumberStats}
                  comparisonType={selectedComparison}
                />
              </div>
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Volunteer Workload and Task Completion Analysis">
          <Row>
            <Col lg={{ size: 6 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Volunteer Hours Distribution</p>
                </div>
                <div
                  className="d-flex flex-column justify-content-center mt-4 gap-3"
                  style={{ gap: '20px' }}
                >
                  <VolunteerHoursDistribution
                    isLoading={isLoading}
                    darkMode={darkMode}
                    hoursData={volunteerStats?.volunteerHoursStats}
                    totalHoursData={volunteerStats?.totalHoursWorked}
                    comparisonType={selectedComparison}
                  />
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <NumbersVolunteerWorked
                      isLoading={isLoading}
                      data={volunteerStats?.volunteersOverAssignedTime}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={{ size: 3 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Task Completed</p>
                </div>
                <div className="mt-4">
                  <TaskCompletedBarChart
                    isLoading={isLoading}
                    data={volunteerStats?.tasksStats}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </Col>
            <Col lg={{ size: 3 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Hours Completed</p>
                </div>
                <div className="mt-4">
                  <HoursCompletedBarChart
                    isLoading={isLoading}
                    data={volunteerStats?.taskAndProjectStats}
                    darkMode={darkMode}
                    comparisonType={selectedComparison}
                  />
                </div>
              </div>
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Volunteer Engagement Trends and Milestones">
          <Row>
            <Col lg={{ size: 7 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Volunteer Trends by Time</p>
                </div>
                <VolunteerTrendsLineChart darkMode={darkMode} />
              </div>
            </Col>
            <Col lg={{ size: 5 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Anniversary Celebrated</p>
                </div>
                <AnniversaryCelebrated
                  isLoading={isLoading}
                  data={volunteerStats?.anniversaryStats}
                  darkMode={darkMode}
                  comparisonType={selectedComparison}
                />
              </div>
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Volunteer Work and Role Distribution">
          <Row>
            <Col lg={{ size: 7 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Work Distribution</p>
                </div>
                <WorkDistributionBarChart
                  isLoading={isLoading}
                  workDistributionStats={volunteerStats?.workDistributionStats}
                  comparisonType={selectedComparison}
                />
              </div>
            </Col>
            <Col lg={{ size: 5 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Role Distribution</p>
                </div>
                <RoleDistributionPieChart
                  isLoading={isLoading}
                  roleDistributionStats={volunteerStats?.roleDistributionStats}
                  darkMode={darkMode}
                  comparisonType={selectedComparison}
                />
              </div>
            </Col>
          </Row>
        </AccordianWrapper>
        <AccordianWrapper title="Teams and Blue Squares">
          <Row>
            <Col lg={{ size: 6 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Team Stats</p>
                </div>
                <TeamStats
                  isLoading={isLoading}
                  usersInTeamStats={volunteerStats?.usersInTeamStats}
                  endDate={currentToDate}
                  comparisonType={selectedComparison}
                />
              </div>
            </Col>
            <Col lg={{ size: 6 }}>
              <div
                className={clsx(styles.componentContainer, styles.componentBorder)}
                data-pdf-block
              >
                <div
                  className={clsx(
                    styles.totalOrgChartTitle,
                    darkMode && styles.totalOrgChartTitleDark,
                  )}
                  data-pdf-title
                >
                  <p>Blue Square Stats</p>
                </div>
                <BlueSquareStats
                  isLoading={isLoading}
                  blueSquareStats={volunteerStats?.blueSquareStats}
                  comparisonType={selectedComparison}
                  darkMode={darkMode}
                />
              </div>
            </Col>
          </Row>
        </AccordianWrapper>
      </div>
      {/* ← closes ref wrapper */}
    </Container>
  );
}

const mapStateToProps = state => ({
  error: state.error,
  loading: state.loading,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => ({
  getTotalOrgSummary: (startDate, endDate, comparisonStartDate, comparisonEndDate) =>
    dispatch(getTotalOrgSummary(startDate, endDate, comparisonStartDate, comparisonEndDate)),
  getTaskAndProjectStats: (startDate, endDate) =>
    dispatch(getTaskAndProjectStats(startDate, endDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
