import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect, useSelector, useDispatch } from 'react-redux';
import { cantUpdateDevAdminDetails } from '~/utils/permissions';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from '~/utils/constants';
import { updateSummaryBarData } from '~/actions/dashboardActions';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import styles from './Dashboard.module.css';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import { toast } from 'react-toastify';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [filteredUserTeamIds, setFilteredUserTeamIds] = useState([]);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { match, authUser } = props;

  // Add null checks and fallbacks for props
  const safeMatch = match || {};
  const safeAuthUser = authUser || {};

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  const [displayUserId, setDisplayUserId] = useState(
    safeMatch.params?.userId || viewingUser?.userId || safeAuthUser.userid || null,
  );
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, safeAuthUser.email);
  const darkMode = useSelector(state => state.theme.darkMode);

  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  useEffect(() => {
    dispatch(updateSummaryBarData({ summaryBarData }));
  }, [summaryBarData]);

  // Add error boundary for the component
  if (!safeAuthUser || !safeAuthUser.userid) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '50vh' }}
      >
        <div className="text-center">
          <i className="fa fa-spinner fa-pulse fa-2x text-primary"></i>
          <p className="mt-2">Loading user data...</p>
        </div>
      </div>
    );
  }

  const toggle = () => {
    if (isNotAllowedToEdit) {
      const warningMessage =
        viewingUser?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY
          ? DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY
          : PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE;
      toast.warn(warningMessage);
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

  const handleStorageEvent = () => {
    const sessionStorageData = checkSessionStorage();
    setViewingUser(sessionStorageData || false);
    setDisplayUserId(sessionStorageData ? sessionStorageData.userId : authUser.userid);
  };

  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      {/* <FeedbackModal /> */}
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={safeAuthUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
      />
      <Row className="w-100 ml-1">
        <Col lg={7}></Col>
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
                userRole={safeAuthUser.role}
                displayUserId={displayUserId}
                displayUserEmail={viewingUser?.email}
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
            displayUserId={displayUserId}
            isNotAllowedToEdit={isNotAllowedToEdit}
            darkMode={darkMode}
            setFilteredUserTeamIds={setFilteredUserTeamIds}
          />
        </Col>
        <Col lg={7} className="left-col-dashboard order-lg-1 order-1">
          {popup && (
            <div className="my-2" id="weeklySum">
              <WeeklySummary
                displayUserId={displayUserId}
                setPopup={setPopup}
                userRole={safeAuthUser.role}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          )}
          <div className="my-2" id="wsummary">
            <Timelog
              isDashboard
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
