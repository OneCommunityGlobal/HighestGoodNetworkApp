import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Row, Col, Container } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import PopUpBar from '../PopUpBar';
import '../../App.css';
import { getTimeZoneAPIKey } from '../../actions/timezoneAPIActions';
import TimeOffRequestDetailModal from './TimeOffRequestDetailModal';

export function Dashboard(props) {
  const dispatch = useDispatch();
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const { match, authUser } = props;
  const displayUserId = match.params.userId || authUser.userid;

  const isAuthUser = displayUserId === authUser.userid;

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

  return (
    <Container fluid className="pad">
      {!isAuthUser ? <PopUpBar component="dashboard" /> : ''}
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
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1 pad">
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
            <Timelog isDashboard passSummaryBarData={setSummaryBarData} match={match} />
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

export default connect(mapStateToProps, {
  getTimeZoneAPIKey,
})(Dashboard);
