import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'reactstrap';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import PopUpBar from '../PopUpBar';
import '../../App.css';
import { connect } from 'react-redux';
import { getUserProfile } from '../../actions/userProfile';
import { getTimeZoneAPIKey } from '../../actions/timezoneAPIActions';

export const Dashboard = props => {
  const [popup, setPopup] = useState(false);
  const [leaderData, setLeaderData] = useState(null);
  const [submittedSummary, setSubmittedSummary] = useState(false);
  const [userProfile, setUserProfile] = useState(undefined);

  const [theme, setTheme] = useState('light');
  let userId = props.match.params.userId ? props.match.params.userId : props.auth.user.userid;

  const toggle = () => {
    setPopup(!popup);
    setTimeout(() => {
      let elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  const toggleTheme = () => {
    if (theme === 'light') {
      localStorage.setItem('mode',"dark");
      setTheme('dark');
    } else {
      localStorage.setItem('mode',"light");
    setTheme('light');
    }
  };

  useEffect(() => {
    props.getTimeZoneAPIKey();
    const mode = localStorage.getItem('mode');
    if(mode){
      setTheme(mode)
    }

  }, []);

  useEffect(() => {
    if (props.match.params && props.match.params.userId && userId != props.match.params.userId) {
      userId = props.match.params.userId;
      getUserProfile(userId);
    }
  }, [props.match]);

  useEffect(() => {
    document.body.className = theme;
    }, [theme]);

    

  return (
    <Container fluid>
      <PopUpBar />
      <SummaryBar
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        asUser={userId}
        toggleSubmitForm={toggle}
        role={props.auth.user.role}
        leaderData={leaderData}
      />

      <Row>
        <Col lg={{ size: 7 }}>&nbsp;</Col>
        <Col lg={{ size: 5 }}>
          <div className="row justify-content-center {`${theme}`}">
            <button onClick={toggleTheme}>Toggle Theme</button>
            <div
              role="button"
              className="mt-3 mb-5 text-center"
              onClick={toggle}
              onKeyDown={toggle}
              tabIndex="0"
            >
              <WeeklySummary
                isDashboard={true}
                isPopup={popup}
                asUser={userId}
                setSubmittedSummary={setSubmittedSummary}
              />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard asUser={userId} setLeaderData={setLeaderData} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} />
              </div>
            </div>
          ) : null}
          <div className="my-2">
            <a name="wsummary"></a>
            <Timelog isDashboard asUser={userId} userProfile={userProfile} />
          </div>
          <Badge userId={userId} role={props.auth.user.role} />
        </Col>
      </Row>
    </Container>
  );
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {
  getTimeZoneAPIKey,
})(Dashboard);
