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
  const [theme, setTheme] = useState('light');

  // let userId = props.match.params.userId ? props.match.params.userId : props.auth.user.userid;


  const { match, auth } = props;
  const displayUserId = match.params.userId || auth.user.userid;

  const toggle = () => {
    setPopup(!popup);
    setTimeout(() => {
      const elem = document.getElementById('weeklySum');
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  };

  // const toggleTheme = e => {
  //   if (theme === 'dark' || e.target.value === 'checked') {
  //     localStorage.setItem('mode', 'light');
  //     setTheme('light');
  //   } else {
  //     localStorage.setItem('mode', 'dark');
  //     setTheme('dark');
  //   }
  // };

  useEffect(() => {
    // eslint-disable-next-line react/destructuring-assignment
    props.getTimeZoneAPIKey();
  }, []);

  useEffect(() => {
    const {
      match: { params },
      getUserProfile,
    } = props;
    if (params && params.userId && displayUserId !== params.userId) {
      getUserProfile(params.userId);
    }
  }, [props]);

  return (
    <Container fluid>
      {match.params.userId && auth.user.userid !== match.params.userId ? (
        <PopUpBar component="dashboard" />
      ) : (
        ''
      )}
      <SummaryBar
        displayUserId={displayUserId}
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
              <WeeklySummary isDashboard isPopup={popup} displayUserId={displayUserId} />
            </div>
            <div />
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard displayUserId={displayUserId} />
        </Col>

        {/* <Col> */}
        {/* <button type="button" onClick={toggleTheme}>
            Toggle Theme
          </button> */}
        {/* </Col> */}
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary displayUserId={displayUserId} setPopup={setPopup} />
              </div>
            </div>
          ) : null}
          <div className="my-2" id="wsummary">
            <Timelog isDashboard passSummaryBarData={setSummaryBarData} />
          </div>
          <Badge userId={displayUserId} role={auth.user.role} />
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
