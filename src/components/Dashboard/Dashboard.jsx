import { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect } from 'react-redux';
import { getTimeZoneAPIKey } from '../../actions/timezoneAPIActions';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import '../../App.css';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);

  const { auth, viewingUser } = props;
  const getInitialUserId = () => (viewingUser.isViewing ? viewingUser.user._id : auth.user.userid);
  const [userId, setUserId] = useState(getInitialUserId());

  const toggle = () => {
    setPopup(!popup);
    setTimeout(() => {
      const elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  useEffect(() => {
    // eslint-disable-next-line react/destructuring-assignment
    props.getTimeZoneAPIKey();
  }, []);

  useEffect(() => {
    setUserId(getInitialUserId());
  }, [viewingUser, auth.user]);

  return (
    <Container fluid>
      <SummaryBar
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        asUser={userId}
        toggleSubmitForm={toggle}
        role={auth.user.role}
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
              <WeeklySummary isDashboard isPopup={popup} asUser={userId} />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard asUser={userId} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} setPopup={setPopup} />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog isDashboard asUser={userId} passSummaryBarData={setSummaryBarData} />
          </div>
          <Badge userId={userId} role={auth.user.role} />
        </Col>
      </Row>
    </Container>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  viewingUser: state.viewingUser,
});

export default connect(mapStateToProps, {
  getTimeZoneAPIKey,
})(Dashboard);
