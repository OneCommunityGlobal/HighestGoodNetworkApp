/* eslint-disable no-shadow */
/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */

import { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { connect, useSelector, useDispatch } from 'react-redux';
import {
  Alert,
  Container,
  Row,
  Col,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import { MultiSelect } from 'react-multi-select-component';
import './WeeklySummariesReport.css';
import moment from 'moment';
import 'moment-timezone';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import SkeletonLoading from '../common/SkeletonLoading';
import FormattedReport from './FormattedReport';
import GeneratePdfReport from './GeneratePdfReport';
import { fetchAllBadges } from '../../actions/badgeManagement';
import { getWeeklySummariesReport } from '../../actions/weeklySummariesReport';
import hasPermission from '../../utils/permissions';
import { getInfoCollections } from '../../actions/information';

const navItems = ['This Week', 'Last Week', 'Week Before Last', 'Three Weeks Ago'];

const weekDates = Array.from({ length: 4 }).map((_, index) => ({
  fromDate: moment()
    .tz('America/Los_Angeles')
    .startOf('week')
    .subtract(index, 'week')
    .format('MMM-DD-YY'),
  toDate: moment()
    .tz('America/Los_Angeles')
    .endOf('week')
    .subtract(index, 'week')
    .format('MMM-DD-YY'),
}));

function WeeklySummariesReport() {
  const props = useSelector(state => state);
  console.log('props', props);

  const error = useSelector(state => state?.weeklySummariesReport?.error);
  const allBadgeData = useSelector(state => state?.badge?.allBadgeData);
  const authUser = useSelector(state => state?.auth?.user);
  const infoCollections = useSelector(state => state?.infoCollections?.infos);
  const role = useSelector(state => state?.userProfile?.role);
  // console.log('infoCollections', infoCollections);
  // console.log('authUser', authUser);
  // console.log('allbadgedata', allBadgeData);
  // console.log('args', args);

  // const func = state => {
  //   console.log('I am an arrow function');
  //   console.log('state', state);
  //   return state;
  // };

  // const auth = useSelector(state => state);
  // function func(state) {
  //   console.log("I'm a function");
  // }
  // console.log('auth', auth);

  const [bioEditPermission, setBioEditPermission] = useState(false);
  const [canEditSummaryCount, setCanEditSummaryCount] = useState(false);
  const [codeEditPermission, setCodeEditPermission] = useState(false);
  const [canSeeBioHighlight, setCanSeeBioHighlight] = useState(false);

  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  const [activeTab, setActiveTab] = useState(navItems[1]);
  // three new set from the latest commit
  // const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  // const [isValidPwd, setIsValidPwd] = useState(true);
  // const [summaryRecepientsPopupOpen, setSummaryRecepientsPopupOpen] = useState(false);
  const [badges, setBadges] = useState([]);
  const [loadBadges, setLoadBadges] = useState(false);
  const [hasSeeBadgePermission, setHasSeeBadgePermission] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [teamCodes, setTeamCodes] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [auth, setAuth] = useState([]);
  const [allRoleInfo, setAllRoleInfo] = useState([]);
  const [selectedOverTime, setSelectedOverTime] = useState([false]);
  const [selectedBioStatus, setSelectedBioStatus] = useState([false]);
  // const [role, setRole] = useState('');

  const dispatch = useDispatch();

  // Tool functions
  /**
   * Get the roleNames
   * @param {*} summaries
   * @returns
   */
  const getAllRoles = summaries => {
    const roleNames = summaries.map(summary => `${summary.role}Info`);
    const uniqueRoleNames = [...new Set(roleNames)];
    return uniqueRoleNames;
  };
  useEffect(() => {
    const fetchData = async () => {
      const res = await dispatch(getWeeklySummariesReport());
      const badgeStatusCode = await dispatch(fetchAllBadges());
      // console.log('badgeStatusCode', badgeStatusCode);
      setLoading(false);
      // console.log('RES:', res);

      const canPutUserProfileImportantInfo = hasPermission('putUserProfileImportantInfo');
      const bioEditPermission = canPutUserProfileImportantInfo;
      const canEditSummaryCount = canPutUserProfileImportantInfo;
      const codeEditPermission =
        hasPermission('editTeamCode') ||
        auth.user.role === 'Owner' ||
        auth.user.role === 'Administrator';
      const canSeeBioHighlight = hasPermission('highlightEligibleBios');

      //     // 2. shallow copy and sort
      let summariesCopy = [...res.data];
      summariesCopy = alphabetize(summariesCopy);

      //     // 3. add new key of promised hours by week
      summariesCopy = summariesCopy.map(summary => {
        // append the promised hours starting from the latest week (this week)
        const promisedHoursByWeek = weekDates.map(weekDate =>
          getPromisedHours(weekDate.toDate, summary.weeklycommittedHoursHistory),
        );
        return { ...summary, promisedHoursByWeek };
      });

      /*
       * refactor logic of commentted codes above
       */
      const teamCodeGroup = {};
      const teamCodes = [];
      const colorOptionGroup = new Set();
      const colorOptions = [];

      summariesCopy.forEach(summary => {
        const code = summary.teamCode || 'noCodeLabel';
        if (teamCodeGroup[code]) {
          teamCodeGroup[code].push(summary);
        } else {
          teamCodeGroup[code] = [summary];
        }

        if (summary.weeklySummaryOption) colorOptionGroup.add(summary.weeklySummaryOption);
      });

      Object.keys(teamCodeGroup).forEach(code => {
        if (code !== 'noCodeLabel') {
          teamCodes.push({
            value: code,
            label: `${code} (${teamCodeGroup[code].length})`,
          });
        }
      });
      colorOptionGroup.forEach(option => {
        colorOptions.push({
          value: option,
          label: option,
        });
      });

      colorOptions.sort((a, b) => `${a.label}`.localeCompare(`${b.label}`));
      teamCodes
        .sort((a, b) => `${a.label}`.localeCompare(`${b.label}`))
        .push({
          value: '',
          label: `Select All With NO Code (${teamCodeGroup.noCodeLabel?.length || 0})`,
        });

      setSummaries(summariesCopy);
      setActiveTab(
        sessionStorage.getItem('tabSelection') === null
          ? navItems[1]
          : sessionStorage.getItem('tabSelection'),
      );
      setBadges(allBadgeData);
      setHasSeeBadgePermission(badgeStatusCode === 200);
      setFilteredSummaries(summariesCopy);
      setColorOptions(colorOptions);
      setTeamCodes(teamCodes);
      setAuth(auth);

      await getInfoCollections();
      const role = authUser?.role;
      const roleInfoNames = getAllRoles(summariesCopy);
      const allRoleInfo = [];
      if (Array.isArray(infoCollections)) {
        infoCollections.forEach(info => {
          if (roleInfoNames?.includes(info.infoName)) {
            const visible =
              info.visibility === '0' ||
              (info.visibility === '1' && (role === 'Owner' || role === 'Administrator')) ||
              (info.visibility === '2' && role !== 'Volunteer');
            // eslint-disable-next-line no-param-reassign
            info.CanRead = visible;
            allRoleInfo.push(info);
          }
        });
      }
      setAllRoleInfo(allRoleInfo);
    };
    fetchData();
    console.log('useffect being called');
  }, []);
  /**
   * Sort the summaries in alphabetixal order
   * @param {*} summaries
   * @returns
   */
  const alphabetize = summaries => {
    const temp = [...summaries];
    return temp.sort((a, b) =>
      `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastname}`),
    );
  };

  /**
   * This function calculates the hours promised by a user by a given end date of the week.
   * It goes through the user's committed hours history and returns the last committed hour value that is less than or equal to the given date.
   * If there's no such record in the history, it returns 10 (default value).
   * If the history does not exist at all, it returns -1.
   *
   * @param {string} weekToDateX - The end date of the week in question. It should be a string that can be parsed into a Date object.
   * @param {Array<Object>} weeklycommittedHoursHistory - An array of user's committed hours history records. Each record should be an object that contains at least the properties 'dateChanged' (a string that can be parsed into a Date object) and 'hours' (a number).
   *
   * @returns {number} The hours promised by the user by the given end date.
   */
  const getPromisedHours = (weekToDateX, weeklycommittedHoursHistory) => {
    // 0. Edge case: If the history doesnt even exist
    // only happens if the user is created without the backend changes
    if (!weeklycommittedHoursHistory) {
      return -1;
    }
    // 1. Edge case: If there is none, return 10 (the default value of weeklyComHours)
    if (weeklycommittedHoursHistory.length === 0) {
      return 10;
    }

    const weekToDateReformat = new Date(weekToDateX).setHours(23, 59, 59, 999);
    // 2. Iterate weeklycommittedHoursHistory from the last index (-1) to the beginning
    for (let i = weeklycommittedHoursHistory.length - 1; i >= 0; i -= 1) {
      const historyDateX = new Date(weeklycommittedHoursHistory[i].dateChanged);
      // console.log(`${weekToDateX} >= ${historyDateX} is ${weekToDateX >= historyDateX}`);
      // As soon as the weekToDate is greater or equal than current history date
      if (weekToDateReformat >= historyDateX) {
        // return the promised hour
        return weeklycommittedHoursHistory[i].hours;
      }
    }

    // 3. at this date when the week ends, the person has not even join the team
    // so it promised 0 hours
    return 0;
  };

  const toggleTab = tab => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      sessionStorage.setItem('tabSelection', tab);
    }
  };

  const filterWeeklySummaries = () => {
    const selectedCodesArray = selectedCodes.map(e => e.value);
    const selectedColorsArray = selectedColors.map(e => e.value);

    const temp = summaries.filter(summary => {
      const hoursLogged = (summary.totalSeconds[navItems.indexOf(activeTab)] || 0) / 3600;

      const isMeetCriteria =
        summary.totalTangibleHrs > 80 && summary.daysInTeam > 60 && summary.bioPosted !== 'posted';

      const isBio = !selectedBioStatus || isMeetCriteria;

      const isOverHours =
        !selectedOverTime ||
        (hoursLogged > 0 &&
          hoursLogged >= summary.promisedHoursByWeek[navItems.indexOf(activeTab)] * 1.25);

      return (
        (selectedCodesArray.length === 0 || selectedCodesArray.includes(summary.teamCode)) &&
        (selectedColorsArray.length === 0 ||
          selectedColorsArray.includes(summary.weeklySummaryOption)) &&
        isOverHours &&
        isBio
      );
    });
    setFilteredSummaries(temp);
  };
  useEffect(() => {
    if (selectedCodes !== null) {
      filterWeeklySummaries();
    }
  }, [selectedCodes]);

  const handleSelectCodeChange = event => {
    setSelectedCodes(event);
  };

  useEffect(() => {
    if (selectedColors !== null) {
      filterWeeklySummaries();
    }
  }, [selectedColors]);

  const handleSelectColorChange = event => {
    setSelectedColors(event);
  };

  useEffect(() => {
    filterWeeklySummaries();
  }, [selectedOverTime, selectedBioStatus]);

  const handleOverHoursToggleChange = () => {
    setSelectedOverTime(!selectedOverTime);
  };

  const handleBioStatusToggleChange = () => {
    setSelectedBioStatus(!selectedBioStatus);
  };

  if (error) {
    return (
      <Container>
        <Row className="align-self-center" data-testid="error">
          <Col>
            <Alert color="danger">Error! {error.message}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }
  if (loading) {
    return (
      <Container fluid style={{ backgroundColor: '#f3f4f6' }}>
        <Row className="text-center" data-testid="loading">
          <SkeletonLoading template="WeeklySummariesReport" />
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="bg--white-smoke py-3 mb-5">
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
          <h3 className="mt-3 mb-5">
            <div className="d-flex align-items-center">
              <span className="mr-2">Weekly Summaries Reports page</span>
              <EditableInfoModal
                areaName="WeeklySummariesReport"
                areaTitle="Weekly Summaries Report"
                role={role} // 大问题，这个role去掉state的话会报错undefined
                fontSize={24}
                isPermissionPage
                className="p-2" // Add Bootstrap padding class to the EditableInfoModal
              />
            </div>
          </h3>
        </Col>
      </Row>
      <Row style={{ marginBottom: '10px' }}>
        <Col lg={{ size: 5, offset: 1 }} xs={{ size: 5, offset: 1 }}>
          Select Team Code
          <MultiSelect
            className="multi-select-filter"
            options={teamCodes}
            value={selectedCodes}
            onChange={e => {
              handleSelectCodeChange(e);
            }}
          />
        </Col>
        <Col lg={{ size: 5 }} xs={{ size: 5 }}>
          Select Color
          <MultiSelect
            className="multi-select-filter"
            options={colorOptions}
            value={selectedColors}
            onChange={e => {
              handleSelectColorChange(e);
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 10, offset: 1 }}>
          <Nav tabs>
            {navItems.map(item => (
              <NavItem key={item}>
                <NavLink
                  href="#"
                  data-testid={item}
                  active={item === activeTab}
                  onClick={() => toggleTab(item)}
                >
                  {item}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
          <TabContent activeTab={activeTab} className="p-4">
            {navItems.map((item, index) => (
              <WeeklySummariesReportTab tabId={item} key={item} hidden={item !== activeTab}>
                <Row>
                  <Col sm="12" md="6" className="mb-2">
                    From <b>{weekDates[index].fromDate}</b> to <b>{weekDates[index].toDate}</b>
                  </Col>
                  <Col sm="12" md="6" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <GeneratePdfReport
                      summaries={filteredSummaries}
                      weekIndex={index}
                      weekDates={weekDates[index]}
                    />
                    {hasSeeBadgePermission && (
                      <Button
                        className="btn--dark-sea-green"
                        style={boxStyle}
                        onClick={() => setLoadBadges(!loadBadges)}
                      >
                        {loadBadges ? 'Hide Badges' : 'Load Badges'}
                      </Button>
                    )}
                    <Button className="btn--dark-sea-green" style={boxStyle}>
                      Load Trophies
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <b>Total Team Members:</b> {filteredSummaries?.length}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormattedReport
                      summaries={filteredSummaries}
                      weekIndex={index}
                      bioCanEdit={bioEditPermission}
                      canEditSummaryCount={canEditSummaryCount}
                      allRoleInfo={allRoleInfo}
                      badges={badges}
                      loadBadges={loadBadges}
                      canEditTeamCode={codeEditPermission}
                      auth={auth}
                      canSeeBioHighlight={canSeeBioHighlight}
                    />
                  </Col>
                </Row>
              </WeeklySummariesReportTab>
            ))}
          </TabContent>
        </Col>
      </Row>
    </Container>
  );
}

function WeeklySummariesReportTab({ tabId, hidden, children }) {
  return <TabPane tabId={tabId}>{!hidden && children}</TabPane>;
}
export default WeeklySummariesReport;
