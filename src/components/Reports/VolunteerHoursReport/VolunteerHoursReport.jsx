import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Card, CardBody, CardHeader, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import moment from 'moment-timezone';
import { getUsersTotalHoursForSpecifiedPeriod } from '../../../actions/timeEntries';
import { getAllUserTeams } from '../../../actions/allTeamsAction';
import { fetchAllProjects } from '../../../actions/projects';
import { getUserProfileBasicInfo } from '../../../actions/userManagement';
import Loading from '../../common/Loading';
import styles from './VolunteerHoursReport.module.css';
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const VolunteerHoursReport = ({
  darkMode,
  userProfiles,
  getUsersTotalHoursForSpecifiedPeriod,
  getAllUserTeams,
  fetchAllProjects,
  getUserProfileBasicInfo
}) => {
  const [reportType, setReportType] = useState('person'); // 'person', 'team', 'project'
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(30, 'days').toDate(),
    endDate: new Date()
  });
  const [appliedDateRange, setAppliedDateRange] = useState({
  startDate: moment().subtract(30, 'days').toDate(),
  endDate: new Date(),
});

  const [validationError, setValidationError] = useState('');
  const [reportError, setReportError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(reportData.length / itemsPerPage);
  const paginatedReportData = reportData.slice(
  (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Load initial data
useEffect(() => {
  const loadData = async () => {
    await Promise.all([
      getAllUserTeams(),
      fetchAllProjects(),
      getUserProfileBasicInfo({ source: 'VolunteerHoursReport' }),
    ]);
  };
    loadData().catch(error => {
    console.error('Error loading Volunteer Hours Report data:', error);
  });
}, []); 
  
    
// Generate report data based on selected type
const generateReport = useCallback(async () => {
console.log('Generating Volunteer Hours Report:', {
    reportType,
    appliedDateRange,
    userProfilesCount: userProfiles?.length,
  });

const start = moment(appliedDateRange.startDate);
const end = moment(appliedDateRange.endDate);

if (
  !start.isValid() ||
  !end.isValid() ||
  end.isBefore(start, 'day')
) {
  setValidationError(
    'Please select valid From Date and To Date values. To Date must not be earlier than From Date.'
  );
  return;
}

setValidationError('');
setReportData([]);
setCurrentPage(1);
setLoading(true);

try {
  const fromDate = start.format('YYYY-MM-DD');
  const toDate = end.format('YYYY-MM-DD');

  let data = [];

    // Keep your existing person/team/project branches here.
      if (reportType === 'person') {
        // Get hours for all active users
        const activeUsers = userProfiles?.filter(user => user.isActive) || [];
        const userIds = activeUsers.map(user => user._id);

        if (userIds.length > 0) {
          const hoursData = await getUsersTotalHoursForSpecifiedPeriod(userIds, fromDate, toDate);
          data = activeUsers.map(user => {
            const userHours = hoursData?.find(h => h.userId === user._id);
            return {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              totalHours: userHours ? Math.round(userHours.totalHours * 10) / 10 : 0
            };
          }).filter(item => item.totalHours > 0); // Only show people with hours
        }
      } else if (reportType === 'team') {
        const res = await axios.post(ENDPOINTS.TEAMS_COMMITTED_HOURS,{fromDate, toDate});
        data = res.data.map(team => ({
               id: team.teamId,
               name: team.teamName,
               totalHours: Number(team.committedHours.toFixed(1)),
      })).filter(team => team.totalHours > 0);

      } else if (reportType === 'project') {
        const res = await axios.post(ENDPOINTS.PROJECTS_COMMITTED_HOURS, {fromDate, toDate});
        data = res.data.map(project => ({
        id: project.projectId,
        name: project.projectName,
        totalHours: Number(project.committedHours.toFixed(1)),
      })).filter(project => project.totalHours > 0);
      }

      // Sort by total hours descending
      data.sort((a, b) => b.totalHours - a.totalHours);
      setReportData(data);
      setCurrentPage(1);
    } catch (error) {
                console.error('Error generating report:', error);
                setReportData([]);
                setReportError(
                  `Failed to load ${reportType} report. Please try again.`
                );
              } finally {
                setLoading(false);
              }
  }, [reportType, appliedDateRange,userProfiles,getUsersTotalHoursForSpecifiedPeriod]);

  // Auto-generate report when report type or date range changes
  useEffect(() => {
  // By Person requires user profiles; Team and Project do not.
  if (reportType === 'person' && (!userProfiles || userProfiles.length === 0)) {
    return;
  }
  generateReport();
}, [reportType, userProfiles, generateReport]);

  const formatDateRange = () => {
  return `${moment(appliedDateRange.startDate).format('MMM DD, YYYY')} - ${moment(appliedDateRange.endDate).format('MMM DD, YYYY')}`;
};

  const getReportTitle = () => {
    const typeLabels = {
      person: 'People',
      team: 'Teams',
      project: 'Projects'
    };
    return `Volunteer Hours by ${typeLabels[reportType]} - ${formatDateRange()}`;
  };

  const getTableHeaders = () => {
    switch (reportType) {
      case 'person':
          return ['Name', 'Total Hours'];
      case 'team':
         return ['Team Name', 'Total Hours'];
      case 'project':
        return ['Project Name', 'Total Hours'];
      default:
        return [];
    }
  };

  const renderTableRow = (item) => {
    if(reportType) {
        return (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className={styles.hoursCell}>{item.totalHours}</td>
          </tr>
        );
    } else {
        return null;
    }
  }

  return (
    <div className={styles.container}>
      <Card className={darkMode ? 'bg-dark text-light' : ''}>
        <CardHeader>
          <h3>Volunteer Hours Report</h3>
          <p className="text-muted">Track total volunteer hours for nonprofit reporting</p>
        </CardHeader>
        <CardBody>
          {/* Report Type Selection */}
          <Row className={styles.filterRow}>
            <Col md={3} className={styles.filterColumn}>
              <FormGroup>
                <Label for="reportType">Report Type</Label>
                <Input
                  type="select"
                  className={styles.reportTypePicker}
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="person">By Person</option>
                  <option value="team">By Team</option>
                  <option value="project">By Project</option>
                </Input>
              </FormGroup>
            </Col>
            <Col md={6} classname={styles.filterColumn}>
              <Row className={styles.filterRow}>
                <Col md={6} classname={styles.filterColumn}>
                  <FormGroup>
                    <Label for="fromDate">From Date</Label>
                    <DatePicker
                      id="fromDate"
                      className={styles.datePickerInput}
                      selected={dateRange.startDate}
                      minDate={moment('2010-01-01').toDate()}
                      maxDate={dateRange.endDate}
                      onChange={(date) => setDateRange({
                        ...dateRange,
                        startDate: date
                      })}
                      dateFormat="yyyy-MM-dd"
                    />
                  </FormGroup>
                </Col>
                <Col md={6} classname={styles.filterColumn}>
                  <FormGroup>
                    <Label for="toDate">To Date</Label>
                    <DatePicker
                      id="toDate"
                      className={styles.datePickerInput}
                      selected={dateRange.endDate}
                      maxDate={moment().toDate()}
                      minDate={dateRange.startDate}
                      onChange={(date) => setDateRange({
                        ...dateRange,
                        endDate: date
                      })}
                      dateFormat="yyyy-MM-dd"
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            <Col md={2} classname={styles.filterColumn}>
              <FormGroup>

             <Col md={6} className={styles.refreshButtonContainer}>
              <Button
                  color="success"
                  className={styles.refreshButton}
                  onClick={() => {
                      setAppliedDateRange({ ...dateRange });
                  }}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Report'}
                </Button>
                </Col>
              </FormGroup>
            </Col>
          </Row>
          {validationError && (
            <div className="text-danger mb-3" role="alert">
              {validationError}
            </div>
          )}
          
          {reportError && !loading && (
            <div className="alert alert-danger" role="alert">
              {reportError}
            </div>
          )}
          {/* Report Results */}
          {loading && <Loading />}
          
          {reportData.length > 0 && !loading && (
            <div>
              <h4 className="mb-3">{getReportTitle()}</h4>
              <div className={styles.tableContainer}>
               <Table responsive className={`${styles.reportTable} ${darkMode ? 'table-dark' : ''}`}>
                  <thead>
                    <tr>
                      {getTableHeaders().map(header => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedReportData.map(item => renderTableRow(item))}
                  </tbody>
                  <tfoot>
                    <tr className={styles.totalRow}>
                      <td colSpan={getTableHeaders().length - 1}><strong>Total</strong></td>
                      <td className={styles.hoursCell}>
                        <strong>
                          {reportData.reduce((sum, item) => sum + item.totalHours, 0).toFixed(1)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
                {totalPages > 1 && (
  <div className="d-flex justify-content-center align-items-center mt-3 gap-2">
    <Button
      size="sm"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(prev => prev - 1)}
    >
      Previous
    </Button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <Button
      size="sm"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage(prev => prev + 1)}
    >
      Next
    </Button>
  </div>
)}
              </div>
            </div>
          )}

          {reportData.length === 0 && !loading && (
            <div className="text-center text-muted">
              <p className={darkMode ? styles.darkModeText : ''}>No data found for the selected criteria and date range.</p>
              <p className={darkMode ? styles.darkModeText : ''}>Try adjusting your date range or report type.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

const mapStateToProps = state => ({
  darkMode: state.theme.darkMode,
  allTeams: state.allTeamsData.allTeams,
  projects: state.allProjects.projects,
  userProfiles: state.allUserProfilesBasicInfo.userProfilesBasicInfo
});

const mapDispatchToProps = {
  getUsersTotalHoursForSpecifiedPeriod,
  getAllUserTeams,
  fetchAllProjects,
  getUserProfileBasicInfo
};

VolunteerHoursReport.propTypes = {
  darkMode: PropTypes.bool,
  allTeams: PropTypes.array,
  projects: PropTypes.array,
  userProfiles: PropTypes.array,
  getUsersTotalHoursForSpecifiedPeriod: PropTypes.func.isRequired,
  getAllUserTeams: PropTypes.func.isRequired,
  fetchAllProjects: PropTypes.func.isRequired,
  getUserProfileBasicInfo: PropTypes.func.isRequired,
};

VolunteerHoursReport.defaultProps = {
  darkMode: false,
  allTeams: [],
  projects: [],
  userProfiles: [],
};
export default connect(mapStateToProps, mapDispatchToProps)(VolunteerHoursReport);
