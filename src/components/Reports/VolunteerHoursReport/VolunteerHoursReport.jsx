import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Card, CardBody, CardHeader, Row, Col, FormGroup, Label, Input } from 'reactstrap';
import moment from 'moment-timezone';
import { getUsersTotalHoursForSpecifiedPeriod } from '../../../actions/timeEntries';
import { getAllUserTeams } from '../../../actions/allTeamsAction';
import { fetchAllProjects } from '../../../actions/projects';
import { getUserProfileBasicInfo, userProfileUpdateAction } from '../../../actions/userManagement';
import Loading from '../../common/Loading';
import styles from './VolunteerHoursReport.module.css';
import {getTimeEntryByProjectSpecifiedPeriod} from '../../../actions/index'
import { fetchAllTasks} from '../../../actions/task';
import { fetchAllWBS } from '../../../actions/wbs';
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';

const VolunteerHoursReport = ({
  darkMode,
  allTeams,
  projects,
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
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
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
        getUserProfileBasicInfo({ source: 'VolunteerHoursReport' })
      ]);
    };
    loadData();
  }, []); // Remove function dependencies to prevent infinite re-renders
  // ...existing code...

  // Auto-generate report when report type or date range changes
  useEffect(() => {
    // Only generate report if we have the required data loaded
    if (userProfiles && userProfiles.length > 0) {
      generateReport();
    }
  }, [reportType, dateRange]); // Re-run when report type, date range, or generateReport changes

  // Generate report data based on selected type
  const generateReport = useCallback(async () => {

    console.log(reportType);
    setLoading(true);
    try {
      const fromDate = moment(dateRange.startDate).format('YYYY-MM-DD');
      const toDate = moment(dateRange.endDate).format('YYYY-MM-DD');

      let data = [];

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
        const res = await axios.get(ENDPOINTS.TEAMS_COMMITTED_HOURS);
        data = res.data.map(team => ({
               id: team.teamId,
               name: team.teamName,
               totalHours: Number(team.committedHours.toFixed(1)),
    }))

} else if (reportType === 'project') {
        const res = await axios.get(ENDPOINTS.PROJECTS_COMMITTED_HOURS);
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
      // Handle error silently or show user-friendly message
    } finally {
      setLoading(false);
    }
  }, [reportType, dateRange, userProfiles, allTeams, projects, getUsersTotalHoursForSpecifiedPeriod]);

  const formatDateRange = () => {
    return `${moment(dateRange.startDate).format('MMM DD, YYYY')} - ${moment(dateRange.endDate).format('MMM DD, YYYY')}`;
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
    switch (reportType) {
      case 'person':
        return (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className={styles.hoursCell}>{item.totalHours}</td>
          </tr>
        );
      case 'team':
        return (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td className={styles.hoursCell}>{item.totalHours}</td>
    </tr>
  );
      case 'project':
        return (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td className={styles.hoursCell}>{item.totalHours}</td>
          </tr>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <Card className={darkMode ? 'bg-dark text-light' : ''}>
        <CardHeader>
          <h3>Volunteer Hours Report</h3>
          <p className="text-muted">Track total volunteer hours for nonprofit reporting</p>
        </CardHeader>
        <CardBody>
          {/* Report Type Selection */}
          <Row className="mb-4">
            <Col md={4}>
              <FormGroup>
                <Label for="reportType">Report Type</Label>
                <Input
                  type="select"
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
            <Col md={6}>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="fromDate">From Date</Label>
                    <Input
                      type="date"
                      id="fromDate"
                      value={moment(dateRange.startDate).format('YYYY-MM-DD')}
                      min="2010-01-01"
                      max={moment(dateRange.endDate).format('YYYY-MM-DD')}
                      onChange={(e) => setDateRange({
                        ...dateRange,
                        startDate: moment(e.target.value).toDate()
                      })}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="toDate">To Date</Label>
                    <Input
                      type="date"
                      id="toDate"
                      value={moment(dateRange.endDate).format('YYYY-MM-DD')}
                      max={moment().format('YYYY-MM-DD')}
                      min={moment(dateRange.startDate).format('YYYY-MM-DD')}
                      onChange={(e) => setDateRange({
                        ...dateRange,
                        endDate: moment(e.target.value).toDate()
                      })}
                    />
                  </FormGroup>
                </Col>
              </Row>
            </Col>
            <Col md={2}>
              <FormGroup>

                <Button
                  color="success"
                  onClick={generateReport}
                  disabled={loading}
                  
                >
                  {loading ? 'Refreshing...' : 'Refresh Report'}
                </Button>
              </FormGroup>
            </Col>
          </Row>

          {/* Report Results */}
          {loading && <Loading />}

          {reportData.length > 0 && !loading && (
            <div>
              <h4 className="mb-3">{getReportTitle()}</h4>
              <div className={styles.tableContainer}>
                <Table responsive className={darkMode ? 'table-dark' : ''}>
                  <thead>
                    <tr>
                      {getTableHeaders().map((header, index) => (
                        <th key={index}>{header}</th>
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
              <p>No data found for the selected criteria and date range.</p>
              <p>Try adjusting your date range or report type.</p>
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

export default connect(mapStateToProps, mapDispatchToProps)(VolunteerHoursReport);
