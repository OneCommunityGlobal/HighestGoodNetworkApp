import { connect } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Button } from 'reactstrap';
import 'moment-timezone';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const comparisonStartDate = '2025-01-16';
  const comparisonEndDate = '2025-01-26';
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  const allUsersTimeEntries = useSelector(state => state.allUsersTimeEntries);
  
  
const handleSaveAsPDF = async () => {
  if (typeof jsPDF === 'undefined' || typeof html2canvas === 'undefined') {
    alert('Required PDF libraries not loaded. Please refresh the page.');
    return;
  }

  const triggers = document.querySelectorAll('.Collapsible__trigger');
  const originalStates = Array.from(triggers).map(trigger => 
    trigger.classList.contains('is-open')
  );

  try {
    if (!volunteerStats || isLoading) {
      alert('Please wait for data to load before generating PDF');
      return;
    }

    triggers.forEach(trigger => {
      if (!trigger.classList.contains('is-open')) {
        trigger.click();
      }
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await waitForAssets();

    const pdfContainer = document.createElement('div');
    pdfContainer.id = 'pdf-export-container';
    pdfContainer.style.width = '420mm';
    pdfContainer.style.padding = '24mm';
    pdfContainer.style.backgroundColor = '#fff';
    pdfContainer.style.position = 'absolute';
    pdfContainer.style.left = '-9999px';
    pdfContainer.style.boxSizing = 'border-box';

    const originalElement = document.querySelector('.container-total-org-wrapper');
    const clonedElement = originalElement.cloneNode(true);
    
    clonedElement.querySelectorAll('button, .share-pdf-btn, .controls, .no-print').forEach(el => el.remove());
    
    // Fix header structure
    const titleRow = clonedElement.querySelector('.row.d-flex.justify-content-between.align-items-center');
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

    const style = document.createElement('style');
    style.textContent = `
      .container-total-org-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
        width: 100% !important;
        background-color: #fff !important;
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
        margin: 8mm 0 !important;
        padding: 5mm !important;
        border: 1px solid #eee !important;
        border-radius: 0 !important;
        background-color: #fff !important;
      }
      .component-border {
        background-color: #fff !important;
      }
      img, svg, canvas {
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
    `;
    clonedElement.prepend(style);
    
    pdfContainer.appendChild(clonedElement);
    document.body.appendChild(pdfContainer);

    const pdf = new jsPDF({
      orientation: 'portrait',
      format: 'a4',
    });

    const canvas = await html2canvas(pdfContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: pdfContainer.scrollWidth,
      windowHeight: pdfContainer.scrollHeight,
      backgroundColor: '#fff',
      allowTaint: true,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('.header-row, .controls').forEach(el => el.remove());
      }
    }).catch(err => {
      throw new Error('Failed to render page: ' + err.message);
    });

    if (!canvas) {
      throw new Error('html2canvas returned empty canvas');
    }

    const imgData = canvas.toDataURL('image/png');
    if (!imgData || imgData.length < 100) {
      throw new Error('Invalid image data generated');
    }

    const imgWidth = 210; // A4 width minus margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Calculate pagination
    const pageHeight = 277; // A4 height (297mm) minus margins
    let position = 0;
    
    // First page
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    position += pageHeight;

    // Additional pages if needed
    while (position < imgHeight) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -(position), imgWidth, imgHeight);
      position += pageHeight;
    }
    
    pdf.save('volunteer-report-' + new Date().toISOString().slice(0, 10) + '.pdf');
    
    document.body.removeChild(pdfContainer);

  } catch (error) {
    const fallbackSuccess = generateSimplePDF();
    
    if (!fallbackSuccess) {
      alert(`PDF generation failed: ${error.message}\n\nPlease try another browser or contact support.`);
    }
  } finally {
    // Restore original panel states
    triggers.forEach((trigger, index) => {
      if (trigger.classList.contains('is-open') !== originalStates[index]) {
        trigger.click();
      }
    });
  }
};

  // Helper function to wait for all assets to load  
  const waitForAssets = async () => {
  try {
    const elements = document.querySelectorAll('img, .recharts-wrapper, canvas, svg, iframe');
    
    if (elements.length === 0) {
      return;
    }

    const promises = Array.from(elements).map((element) => {
      return new Promise((resolve) => {
        if (element.complete || element.readyState === 'complete') {
          resolve();
          return;
        }

        const timer = setTimeout(() => {
          resolve();
        }, 10000);

        element.onload = () => {
          clearTimeout(timer);
          resolve();
        };
        element.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
      });
    });

    // Wait for fonts if using custom fonts
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    await Promise.all(promises);
    
    // Additional delay for charts to render
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (err) {
    throw err;
  }
};

// Fallback PDF generator
const generateSimplePDF = () => {
  try {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text('Volunteer Report Summary', 105, 15, { align: 'center' });
    pdf.setFontSize(12);
    
    // Add basic volunteer stats
    pdf.text(`Total Volunteers: ${volunteerStats?.total || 'N/A'}`, 20, 30);
    pdf.text(`Active Volunteers: ${volunteerStats?.active || 'N/A'}`, 20, 40);
    pdf.text(`New Volunteers: ${volunteerStats?.new || 'N/A'}`, 20, 50);
    
    pdf.text('Note: Full report generation failed. Please try', 20, 70);
    pdf.text('again or contact support if issue persists.', 20, 80);
    
    pdf.save('volunteer-report-fallback.pdf');
    return true;
  } catch (err) {
    return false;
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
          }
        })
        .catch(() => {
          // Error handling
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
    <Container fluid className={`container-total-org-wrapper py-3 mb-5 ${darkMode ? 'bg-oxford-blue text-light' : 'cbg--white-smoke'}`}>
      <Row className="d-flex justify-content-between align-items-center mb-4">
        <Col lg={{ size: 6 }} className="d-flex align-items-center">
          <h3 className="my-0">Total Org Summary</h3>
        </Col>
        <Col lg={{ size: 6 }} className="d-flex justify-content-end">
          <Button className="share-pdf-btn" onClick={handleSaveAsPDF}>
            Save as PDF
          </Button>
        </Col>
      </Row>
      <hr />
      <AccordianWrapper title="Volunteer Status">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerStatus
                isLoading={isLoading}
                volunteerNumberStats={volunteerStats?.volunteerNumberStats}
                totalHoursWorked={volunteerStats?.totalHoursWorked}
              />
            </div>
          </Col>
        </Row>
      </AccordianWrapper>
      <AccordianWrapper title="Volunteer Activities">
        <Row>
          <Col lg={{ size: 12 }}>
            <div className="component-container">
              <VolunteerActivities
                isLoading={isLoading}
                totalSummariesSubmitted={volunteerStats?.totalSummariesSubmitted}
                completedAssignedHours={volunteerStats?.completedAssignedHours}
                totalBadgesAwarded={volunteerStats?.totalBadgesAwarded}
                tasksStats={volunteerStats?.tasksStats}
                totalActiveTeams={volunteerStats?.totalActiveTeams}
              />
            </div>
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
