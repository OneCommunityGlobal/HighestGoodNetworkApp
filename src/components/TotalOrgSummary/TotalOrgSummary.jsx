/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
import { connect } from 'react-redux';
import { useEffect, useState } from 'react';
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

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';

import '../Header/DarkMode.css';
import './TotalOrgSummary.css';

// components
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

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
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
        setVolunteerStats(volunteerStatsResponse.data);
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

    // Save the current state of collapsible sections.
    const triggers = document.querySelectorAll('.Collapsible__trigger');
    const originalStates = Array.from(triggers).map(trigger =>
      trigger.classList.contains('is-open'),
    );

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

      // 1. Expand all collapsible sections so every part is visible.
      triggers.forEach(trigger => {
        if (!trigger.classList.contains('is-open')) {
          trigger.click();
        }
      });

      // 2. Wait a longer time to ensure charts and content are fully rendered.
      await new Promise(resolve => {
        setTimeout(resolve, 3000);
      });

      // 3. Replace Chart.js canvas elements with images in the live DOM.
      const chartCanvases = document.querySelectorAll('.volunteer-status-chart canvas');
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
      const originalContent = document.querySelector('.container-total-org-wrapper');
      const clonedContent = originalContent.cloneNode(true);

      // Remove interactive or unwanted elements from the clone
      clonedContent
        .querySelectorAll('button, .share-pdf-btn, .controls, .no-print')
        .forEach(el => el.remove());

      // Adjust title row styling for a clean layout
      const titleRow = clonedContent.querySelector(
        '.row.d-flex.justify-content-between.align-items-center',
      );
      if (titleRow) {
        const titleCol = titleRow.querySelector('.col');
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
        .container-total-org-wrapper {
          padding: 20px !important;
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          width: 100% !important;
          min-height: 100% !important;
        }
        .row.d-flex.justify-content-between.align-items-center {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          margin-bottom: 20px !important;
          width: 100% !important;
          padding: 0 !important;
        }
        .component-container {
          page-break-inside: avoid;
          break-inside: avoid;
          margin: 15px 0 !important;
          padding: 20px !important;
          border: 1px solid #eee !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
        }
        .component-border {
          background-color: #fff !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 10px !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05) !important;
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
        .volunteer-status-grid {
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
        .chart-title p {
          font-size: 1.5em !important;
          font-weight: bold !important;
          text-align: center !important;
          margin: 10px !important;
          color: #333 !important;
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
        // backgroundColor: '#fff',
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
      // Restore collapsible sections to their original states
      triggers.forEach((trigger, idx) => {
        if (trigger.classList.contains('is-open') !== originalStates[idx]) {
          trigger.click();
        }
      });
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
      <Container className={`container-wsr-wrapper ${darkMode ? 'bg-oxford-blue' : ''}`}>
        <Row
          className="align-self-center pt-2"
          data-testid="error"
          style={{ width: '30%', margin: '0 auto' }}
        >
          <Col>
            <Alert color="danger">Error! {error.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container
      fluid
      className={`container-total-org-wrapper py-3 mb-5 ${
        darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'
      }`}
    >
      <Row className="report-header-row">
        <div className="report-header-title">
          <h3 className="my-0">Total Org Summary</h3>
        </div>
        <div className="report-header-actions">
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
          <Button className="share-pdf-btn" onClick={handleSaveAsPDF} disabled={isGeneratingPDF}>
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
              <label style={{ display: 'block', marginBottom: '1rem' }}>Start Date</label>
              <div style={{ padding: '0.5rem 0' }}>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  className="form-control"
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select start date"
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '1rem' }}>End Date</label>
              <div style={{ padding: '0.5rem 0' }}>
                <DatePicker
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
                <p>Global Volunteer Network: Uniting Communities Worldwide</p>
              </div>
              <GlobalVolunteerMap isLoading={isLoading} locations={volunteerStats?.userLocations} />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
                <p>Volunteer Status</p>
              </div>
              <VolunteerStatusChart
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Workload and Task Completion Analysis">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
                <p>Volunteer Trends by Time</p>
              </div>
              <VolunteerTrendsLineChart darkMode={darkMode} />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
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
            <div className="component-container component-border">
              <div className={`chart-title ${darkMode ? 'dark-mode' : ''}`}>
                <p>Blue Square Stats</p>
              </div>
              <BlueSquareStats
                isLoading={isLoading}
                blueSquareStats={volunteerStats?.blueSquareStats}
                comparisonType={selectedComparison}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
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
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
