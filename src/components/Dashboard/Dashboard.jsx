import { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import { connect } from 'react-redux';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import PopUpBar from '../PopUpBar';
import '../../App.css';
import { getTimeZoneAPIKey } from '../../actions/timezoneAPIActions';

export function Dashboard(props) {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
  const { match, auth } = props;
  const userId = match.params.userId || auth.user.userid;

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
    getTimeZoneAPIKey();
  }, []);

  useEffect(() => {
    const {
      match: { params },
      getUserProfile,
    } = props;
    if (params && params.userId && userId !== params.userId) {
      getUserProfile(params.userId);
    }
  }, [props]);

  return (
    <Container fluid>
      {match.params.userId && auth.user.userid !== match.params.userId ? <PopUpBar /> : ''}
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
              <WeeklySummary
                isDashboard
                isPopup={popup}
                asUser={userId}
                userRole={auth.user.role}
              />
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
                <WeeklySummary asUser={userId} setPopup={setPopup} userRole={auth.user.role} />
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
});

export default connect(mapStateToProps, {
  getTimeZoneAPIKey,
})(Dashboard);
