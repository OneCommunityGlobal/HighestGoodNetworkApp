/* eslint-disable new-cap */
import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Button } from 'reactstrap';
import 'moment-timezone';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import hasPermission from 'utils/permissions';

// actions
import { getTotalOrgSummary } from 'actions/totalOrgSummary';
import { getAllUserProfile } from 'actions/userManagement';
import { getAllUsersTimeEntries } from 'actions/allUsersTimeEntries';
import { getTimeEntryForOverDate } from 'actions/index';
import { getTaskAndProjectStats } from 'actions/totalOrgSummary';

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
import HoursWorkList from './HoursWorkList/HoursWorkList';
import NumbersVolunteerWorked from './NumbersVolunteerWorked/NumbersVolunteerWorked';
import AnniversaryCelebrated from './AnniversaryCelebrated/AnniversaryCelebrated';
import RoleDistributionPieChart from './VolunteerRolesTeamDynamics/RoleDistributionPieChart';
import WorkDistributionBarChart from './VolunteerRolesTeamDynamics/WorkDistributionBarChart';

function calculateFromDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 7);
  return currentDate.toISOString().split('T')[0];
}

function calculateToDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -1 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

function calculateFromOverDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToSubtract = dayOfWeek === 0 ? 0 : dayOfWeek;
  currentDate.setDate(currentDate.getDate() - daysToSubtract - 14);
  return currentDate.toISOString().split('T')[0];
}

function calculateToOverDate() {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  const dayOfWeek = currentDate.getDay();
  const daysToAdd = dayOfWeek === 6 ? 0 : -8 - dayOfWeek;
  currentDate.setDate(currentDate.getDate() + daysToAdd);
  return currentDate.toISOString().split('T')[0];
}

const fromDate = calculateFromDate();
const toDate = calculateToDate();
const fromOverDate = calculateFromOverDate();
const toOverDate = calculateToOverDate();

const aggregateTimeEntries = userTimeEntries => {
  const aggregatedEntries = {};

  userTimeEntries.forEach(entry => {
    const { personId, hours, minutes } = entry;
    if (!aggregatedEntries[personId]) {
      aggregatedEntries[personId] = {
        hours: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
      };
    } else {
      aggregatedEntries[personId].hours += parseInt(hours, 10);
      aggregatedEntries[personId].minutes += parseInt(minutes, 10);
    }
  });

  Object.keys(aggregatedEntries).forEach(personId => {
    const totalMinutes = aggregatedEntries[personId].minutes;
    const additionalHours = Math.floor(totalMinutes / 60);
    aggregatedEntries[personId].hours += additionalHours;
    aggregatedEntries[personId].minutes = totalMinutes % 60;
  });

  const result = Object.entries(aggregatedEntries).map(([personId, { hours, minutes }]) => ({
    personId,
    hours,
    minutes,
  }));

  return result;
};

function TotalOrgSummary(props) {
  const { darkMode, error, allUserProfiles, volunteerOverview } = props;
  const [usersId, setUsersId] = useState([]);
  const [usersTimeEntries, setUsersTimeEntries] = useState([]);
  const [usersOverTimeEntries, setUsersOverTimeEntries] = useState([]);
  const [taskProjectHours, setTaskProjectHours] = useState([]);
  const [isVolunteerFetchingError, setIsVolunteerFetchingError] = useState(false);
  const [volunteerStats, setVolunteerStats] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const comparisonStartDate = '2025-01-16';
  const comparisonEndDate = '2025-01-26';
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);

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
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = '#fff';
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
          background-color: #fff !important;
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
          background-color: #fff !important;
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
          background-color: #fff !important;
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
        backgroundColor: '#fff',
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

  useEffect(() => {
    dispatch(getAllUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(allUserProfiles.userProfiles) && allUserProfiles.userProfiles.length > 0) {
      const idsList = allUserProfiles.userProfiles.reduce((acc, user) => {
        if (user.isActive) acc.push(user._id);
        return acc;
      }, []);
      setUsersId(idsList);
    }
  }, [allUserProfiles]);

  useEffect(() => {
    if (Array.isArray(usersId) && usersId.length > 0 && fromDate && toDate) {
      dispatch(getAllUsersTimeEntries(usersId, fromDate, toDate));
    }
  }, [usersId, fromDate, toDate, dispatch]);

  useEffect(() => {
    if (
      !Array.isArray(allUsersTimeEntries.usersTimeEntries) ||
      allUsersTimeEntries.usersTimeEntries.length === 0
    ) {
      return;
    }
    const aggregatedEntries = aggregateTimeEntries(allUsersTimeEntries.usersTimeEntries);
    setUsersTimeEntries(aggregatedEntries);
  }, [allUsersTimeEntries]);

  useEffect(() => {
    if (Array.isArray(usersId) && usersId.length > 0) {
      getTimeEntryForOverDate(usersId, fromOverDate, toOverDate)
        .then(response => {
          if (response && Array.isArray(response)) {
            setUsersOverTimeEntries(response);
          } else {
            // eslint-disable-next-line no-console
            console.log('error on fetching data');
          }
        })
        .catch(() => {
          // eslint-disable-next-line no-console
          console.log('error on fetching data');
        });
    }
  }, [allUsersTimeEntries, usersId, fromOverDate, toOverDate]);
  useEffect(() => {
    async function fetchData() {
      const {
        taskHours: { count: taskHours },
        projectHours: { count: projectHours },
      } = await props.getTaskAndProjectStats(fromDate, toDate);
      const {
        taskHours: { count: lastTaskHours },
        projectHours: { count: lastProjectHours },
      } = await props.getTaskAndProjectStats(fromOverDate, toOverDate);

      if (taskHours && projectHours) {
        setTaskProjectHours({
          taskHours,
          projectHours,
          lastTaskHours,
          lastProjectHours,
        });
      }
    }
    fetchData();
  }, [fromDate, toDate, fromOverDate, toOverDate, props]);

  useEffect(() => {
    const fetchVolunteerStats = async () => {
      try {
        const volunteerStatsResponse = await props.getTotalOrgSummary(
          fromDate,
          toDate,
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
  }, [fromDate, toDate, props]);

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
      <Row className="d-flex justify-content-between align-items-center mb-4">
        <Col lg={{ size: 6 }} className="d-flex align-items-center">
          <h3 className="my-0">Total Org Summary</h3>
        </Col>
        <Col lg={{ size: 6 }} className="d-flex justify-content-end">
          <Button className="share-pdf-btn" onClick={handleSaveAsPDF} disabled={isGeneratingPDF}>
            {isGeneratingPDF ? 'Generating PDF...' : 'Save as PDF'}
          </Button>
        </Col>
      </Row>
      <hr />
      <AccordianWrapper title="Volunteer Status">
        <Row>
          <Col lg={{ size: 12 }}>
            <VolunteerStatus
              isLoading={isLoading}
              volunteerNumberStats={volunteerStats?.volunteerNumberStats}
              totalHoursWorked={volunteerStats?.totalHoursWorked}
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
            />
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Global Distribution and Volunteer Status Overview">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Global Volunteer Network: Uniting Communities Worldwide</p>
              </div>
              In progress...
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Volunteer Status</p>
              </div>
              <VolunteerStatusChart
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Workload and Task Completion Analysis">
        <Row
          className={`${darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'} rounded-lg`}
        >
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Volunteer Hours Distribution</p>
              </div>
              <div className="d-flex flex-row justify-content-center flex-wrap my-4">
                <VolunteerHoursDistribution
                  isLoading={isLoading}
                  darkMode={darkMode}
                  usersTimeEntries={usersTimeEntries}
                  usersOverTimeEntries={usersOverTimeEntries}
                  hoursData={volunteerStats?.volunteerHoursStats}
                />
                <div className="d-flex flex-column align-items-center justify-content-center">
                  <HoursWorkList darkMode={darkMode} usersTimeEntries={usersTimeEntries} />
                  <NumbersVolunteerWorked
                    isLoading={isLoading}
                    usersTimeEntries={usersTimeEntries}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Task Completed</p>
              </div>
            </div>
          </Col>
          <Col lg={{ size: 3 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Hours Completed</p>
              </div>
              <div className="mt-4">
                <HoursCompletedBarChart
                  isLoading={isLoading}
                  data={taskProjectHours}
                  darkMode={darkMode}
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
              <div className="chart-title">
                <p>Volunteer Trends by Time</p>
              </div>
              <span className="text-center"> Work in progres...</span>
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Anniversary Celebrated</p>
              </div>
              <AnniversaryCelebrated
                isLoading={isLoading}
                data={volunteerStats?.anniversaryStats}
                darkMode={darkMode}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 7 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Work Distribution</p>
              </div>
              <WorkDistributionBarChart
                isLoading={isLoading}
                workDistributionStats={volunteerOverview?.workDistributionStats}
              />
            </div>
          </Col>
          <Col lg={{ size: 5 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Role Distribution</p>
              </div>
              <RoleDistributionPieChart
                isLoading={isLoading}
                roleDistributionStats={volunteerOverview?.roleDistributionStats}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Roles and Team Dynamics">
        <Row>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Team Stats</p>
              </div>
              <TeamStats
                isLoading={isLoading}
                usersInTeamStats={volunteerStats?.usersInTeamStats}
                endDate={toDate}
              />
            </div>
          </Col>
          <Col lg={{ size: 6 }}>
            <div className="component-container component-border">
              <div className="chart-title">
                <p>Blue Square Stats</p>
              </div>
              <BlueSquareStats
                isLoading={isLoading}
                blueSquareStats={volunteerStats?.blueSquareStats}
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
  volunteerOverview: state.totalOrgSummary.volunteerOverview,
  role: state.auth.user.role,
  auth: state.auth,
  darkMode: state.theme.darkMode,
  allUserProfiles: state.allUserProfiles,
});

const mapDispatchToProps = dispatch => ({
  getTotalOrgSummary: (startDate, endDate, comparisonStartDate, comparisonEndDate) =>
    dispatch(getTotalOrgSummary(startDate, endDate, comparisonStartDate, comparisonEndDate)),
  getTaskAndProjectStats: () => dispatch(getTaskAndProjectStats(fromDate, toDate)),
  hasPermission: permission => dispatch(hasPermission(permission)),
  getAllUserProfile: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(TotalOrgSummary);
