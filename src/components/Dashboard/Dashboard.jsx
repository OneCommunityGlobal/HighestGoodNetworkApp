import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '~/utils/constants';
import { useDispatch } from 'react-redux';
import { updateSummaryBarData } from '~/actions/dashboardActions';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import './Dashboard.css';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [filteredUserTeamIds, setFilteredUserTeamIds] = useState([]);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { match, authUser } = props;
  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('displayUser')) ?? false;
  const [displayUser, setDisplayUser] = useState(authUser);

  const handleStorageEvent = () => {
    const sessionStorageData = checkSessionStorage();
    const normalizedUser = sessionStorageData
      ? { ...sessionStorageData, userid: sessionStorageData.userId }
      : authUser;

    setDisplayUser(normalizedUser);
  };

  useEffect(() => {
    // Set initial displayUser on mount
    handleStorageEvent();
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [authUser]);

  const isNotAllowedToEdit = cantUpdateDevAdminDetails(displayUser?.email, authUser.email);

  const darkMode = useSelector(state => state.theme.darkMode);

  const dispatch = useDispatch();

  const toggle = () => {
    if (isNotAllowedToEdit) {
      const warningMessage =
        displayUser?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY
          ? DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY
          : PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE;
      alert(warningMessage);
      return;
    }

    setPopup(!popup);

    setTimeout(() => {
      const elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  useEffect(() => {
    console.log(summaryBarData);
    dispatch(updateSummaryBarData({ summaryBarData }));
  }, [summaryBarData]);

  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <SummaryBar
        displayUserId={displayUser.userid}
        toggleSubmitForm={toggle}
        role={displayUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
      />

      <Row className="w-100 ml-1">
        <Col lg={7} />
        <Col lg={5}>
          <div className="row justify-content-center">
            <div
              role="button"
              className="mt-3 mb-5 text-center"
              onClick={toggle}
              onKeyDown={toggle}
              tabIndex="0"
            >
              <WeeklySummary
                isDashboard
                isPopup={popup}
                userRole={displayUser.role}
                displayUserId={displayUser.userid}
                displayUserEmail={displayUser?.email}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row className="w-100 ml-1">
        <Col lg={5} className="order-lg-2 order-2">
          <Leaderboard
            displayUserId={displayUser.userid}
            displayUserRole={displayUser.role}
            isNotAllowedToEdit={isNotAllowedToEdit}
            darkMode={darkMode}
            setFilteredUserTeamIds={setFilteredUserTeamIds}
          />
        </Col>
        <Col lg={7} className="left-col-dashboard order-lg-1 order-1">
          {popup && (
            <div className="my-2" id="weeklySum">
              <WeeklySummary
                displayUserId={displayUser.userid}
                setPopup={setPopup}
                userRole={displayUser.role}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          )}
          <div className="my-2" id="wsummary">
            <Timelog
              isDashboard
              userId={displayUser.userid}
              passSummaryBarData={setSummaryBarData}
              isNotAllowedToEdit={isNotAllowedToEdit}
              filteredUserTeamIds={filteredUserTeamIds}
            />
          </div>
        </Col>
      </Row>
      <TimeOffRequestDetailModal isNotAllowedToEdit={isNotAllowedToEdit} />
    </Container>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
  displayUserProfile: state.userProfile,
});

export default connect(mapStateToProps)(Dashboard);
