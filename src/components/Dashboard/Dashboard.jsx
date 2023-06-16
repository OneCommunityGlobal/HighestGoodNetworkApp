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
import axios from 'axios';
import { ENDPOINTS } from '../../utils/URL';


export const Dashboard = props => {
  const [popup, setPopup] = useState(false);
  const [summaryBarData, setSummaryBarData] = useState(null);
  const [userProfile, setUserProfile] = useState(undefined);
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

  useEffect(() => {
    props.getTimeZoneAPIKey();
  }, []);


  const getuser = async()=>{
    const response = await axios.get(ENDPOINTS.USER_PROFILE(userId));
    const newUserProfile = response.data;
    setUserProfile(newUserProfile);
   }
 
   useEffect(() => {
     if (props.match.params && props.match.params.userId && userId != props.match.params.userId) {
       userId = props.match.params.userId;
       getUserProfile(userId)
     }else{
       getuser();
     }
   }, [props.match]);


  return (
    <Container fluid>
      {props.match.params.userId && props.auth.user.userid !== props.match.params.userId ? (
        <PopUpBar />
      ) : (
        ''
      )}
      <SummaryBar
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        asUser={userId}
        toggleSubmitForm={toggle}
        role={props.auth.user.role}
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
              <WeeklySummary isDashboard={true} isPopup={popup} asUser={userId} />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
        <Leaderboard asUser={userId} userTeams={userProfile?.teams} userRole = {userProfile?.role}/>
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? (
            <div className="my-2">
              <div id="weeklySum">
                <WeeklySummary asUser={userId} setPopup={setPopup} />
              </div>
            </div>
          ) : null}
          <div className="my-2">
            <a name="wsummary"></a>
            <Timelog isDashboard={true} asUser={userId} passSummaryBarData={setSummaryBarData} />
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
