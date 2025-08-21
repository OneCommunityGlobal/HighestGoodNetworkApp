import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { useParams } from 'react-router-dom';
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
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import styles from './Dashboard.module.css';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import FeedbackModal from '../FeedbackModal/FeedbackModal';
import { toast } from 'react-toastify';

function Dashboard() {
  const dispatch = useDispatch();
  
  // Use hooks instead of connect to access Redux state
  const authUser = useSelector(state => state.auth.user);
  const displayUserProfile = useSelector(state => state.userProfile);
  const darkMode = useSelector(state => state.theme.darkMode);

  // Get userId from URL params
  const { userId: urlUserId } = useParams();
  
  // Component state
  const [popup, setPopup] = useState(false);
  const [filteredUserTeamIds, setFilteredUserTeamIds] = useState([]);
  const [summaryBarData, setSummaryBarData] = useState(null);
  
  // Memoize this function to avoid recreating it on every render
  const checkSessionStorage = useCallback(() => {
    return JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  }, []);
  
  // State for viewing user
  const [viewingUser, setViewingUser] = useState(checkSessionStorage());
  const [displayUserId, setDisplayUserId] = useState(
    urlUserId || viewingUser?.userId || authUser.userid
  );
  
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, authUser.email);

  // Toggle popup with memoization to prevent recreation
  const toggle = useCallback(() => {
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
  }, [isNotAllowedToEdit, popup, viewingUser?.email]);

  // Memoize storage event handler
  const handleStorageEvent = useCallback(() => {
    const sessionStorageData = checkSessionStorage();
    setViewingUser(sessionStorageData || false);
    setDisplayUserId(sessionStorageData ? sessionStorageData.userId : authUser.userid);
  }, [authUser.userid, checkSessionStorage]);

  // Memoize summary bar update handler
  const handleSummaryBarDataUpdate = useCallback((data) => {
    setSummaryBarData(data);
  }, []);

  // Update Redux store when summaryBarData changes
  useEffect(() => {
    if (summaryBarData) {
      dispatch(updateSummaryBarData({ summaryBarData }));
    }
  }, [dispatch, summaryBarData]);

  // Add storage event listener
  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleStorageEvent]);

  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={authUser.role}
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
                userRole={authUser.role}
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
                userRole={authUser.role}
                isNotAllowedToEdit={isNotAllowedToEdit}
                darkMode={darkMode}
              />
            </div>
          )}
          <div className="my-2" id="wsummary">
            <Timelog
              isDashboard
              passSummaryBarData={handleSummaryBarDataUpdate}
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

export default Dashboard;
