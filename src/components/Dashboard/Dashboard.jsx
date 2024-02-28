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

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { authUser } = props;

  const checkSessionStorage = () => JSON.parse(sessionStorage.getItem('viewingUser')) ?? false;
  const [viewingUser, setViewingUser] = useState(checkSessionStorage);
  const [displayUserId, setDisplayUserId] = useState(
    viewingUser ? viewingUser.userId : authUser.userid,
  );

  const toggle = () => {
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
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard displayUserId={displayUserId} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary
                  displayUserId={displayUserId}
                  setPopup={setPopup}
                  userRole={authUser.role}
                />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog isDashboard passSummaryBarData={setSummaryBarData} />
          </div>
          <Badge userId={displayUserId} role={authUser.role} />
        </Col>
      </Row>
      <TimeOffRequestDetailModal />
    </Container>
  );
}

const mapStateToProps = state => ({
  authUser: state.auth.user,
});

export default connect(mapStateToProps)(Dashboard);
