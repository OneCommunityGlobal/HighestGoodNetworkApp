import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect, useSelector } from 'react-redux';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import './Dashboard.css';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import {
  DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY,
  DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY,
  PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE,
} from 'utils/constants';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { getUserProfile, updateUserProfile } from 'actions/userProfile';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [filteredUserTeamIds, setFilteredUserTeamIds] = useState([]);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { match, authUser, displayUserProfile } = props;
  const { permissions, _id: userId } = displayUserProfile || {};
  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  const [displayUserId, setDisplayUserId] = useState(
    match.params.userId || viewingUser?.userId || authUser.userid,
  );
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, authUser.email);
  const darkMode = useSelector(state => state.theme.darkMode);

  const toggle = (forceOpen = null) => {
    if (isNotAllowedToEdit) {
      const warningMessage =
        viewingUser?.email === DEV_ADMIN_ACCOUNT_EMAIL_DEV_ENV_ONLY
          ? DEV_ADMIN_ACCOUNT_CUSTOM_WARNING_MESSAGE_DEV_ENV_ONLY
          : PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE;
      alert(warningMessage);
      return;
    }

    const shouldOpen = forceOpen !== null ? forceOpen : !popup;
    setPopup(shouldOpen);

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

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const updateAcknow = async () => {
    try {
      const res = await axios.put(ENDPOINTS.USER_PROFILE(userId), {
        _id: userId,
        isAcknowledged: true,
      });
      // console.log('response', res);
      if (res.status == 200) {
        props.getUserProfile(userId);
      }
    } catch (e) {
      console.log('update ack', e);
    }
  };
  return (
    <Container fluid className={darkMode ? 'bg-oxford-blue' : ''}>
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={authUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
      />
      {!permissions?.isAcknowledged ? (
        <button style={{ padding: '15px' }} onClick={updateAcknow}>
          check
        </button>
      ) : null}
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

const mapDispatchToProps = dispatch => {
  return {
    updateUserProfile: data => updateUserProfile(data)(dispatch),
    getUserProfile: userId => getUserProfile(userId)(dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
