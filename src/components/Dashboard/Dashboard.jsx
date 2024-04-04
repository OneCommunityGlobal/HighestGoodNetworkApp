import { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect } from 'react-redux';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import '../../App.css';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';
import { cantUpdateDevAdminDetails } from 'utils/permissions';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { authUser } = props;

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  const [displayUserId, setDisplayUserId] = useState(
    viewingUser ? viewingUser.userId : authUser.userid,
  );
  const isNotAllowedToEdit = cantUpdateDevAdminDetails(viewingUser?.email, authUser.email);

  const toggle = () => {
    if (isNotAllowedToEdit) {
      alert('STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS. Please reconsider your choices.');
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

  useEffect(() => {
    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return (
    <Container fluid>
      <SummaryBar
        displayUserId={displayUserId}
        toggleSubmitForm={toggle}
        role={authUser.role}
        summaryBarData={summaryBarData}
        isNotAllowedToEdit={isNotAllowedToEdit}
      />

      <Row>
        <Col lg={{ size: 7 }}>&nbsp;</Col>
        <Col lg={{ size: 5 }}>
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
                isNotAllowedToEdit={isNotAllowedToEdit}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard displayUserId={displayUserId} isNotAllowedToEdit={isNotAllowedToEdit} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary
                  displayUserId={displayUserId}
                  setPopup={setPopup}
                  userRole={authUser.role}
                  isNotAllowedToEdit={isNotAllowedToEdit}
                />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog
              isDashboard
              passSummaryBarData={setSummaryBarData}
              isNotAllowedToEdit={isNotAllowedToEdit}
            />
          </div>
          <Badge
            userId={displayUserId}
            role={authUser.role}
            isNotAllowedToEdit={isNotAllowedToEdit}
          />
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
