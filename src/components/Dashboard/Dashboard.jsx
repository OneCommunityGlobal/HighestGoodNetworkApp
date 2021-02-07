import React, { useState } from 'react';
import { Alert, Row, Col, Container } from 'reactstrap';
import {Link} from "react-router-dom";
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary/WeeklySummary';
import Badge from '../Badge';
import TeamMemberTasks from '../TeamMemberTasks/TeamMemberTasks'
import Timelog from '../Timelog/Timelog';
import SummaryBar from '../SummaryBar/SummaryBar';
import '../../App.css';
import { connect } from 'react-redux';

const Dashboard = props => {
  const [popup, setPopup] = useState(false);
  const userId = props.match && props.match.params.userId && props.auth.user.role === 'Administrator' ? props.match.params.userId : props.auth.user.userid;
  const toggle = () => {
    setPopup(!popup);
    setTimeout(()=> {
      let elem = document.getElementById("weeklySum");
      if (elem) {
        elem.scrollIntoView();
      }
    }, 150);
  }

  return (
  <Container fluid>
    <Row>
      <Col sm={{ size: 12 }}>
        <Alert color="info">
          <b>Reminder</b>: Make sure to purge the cache or "hard" refresh the page in your browser
          if you don's see the changes you had merged with the "development" branch. This message
          will be removed before the site goes "live".
        </Alert>
      </Col>
    </Row>
    
    <SummaryBar />

      <Row>
        <Col lg={{ size: 7 }}>&nbsp;</Col>
        <Col lg={{ size: 5 }}>
          <div className="row justify-content-center">
            <div role="button" className="mt-3 mb-5 text-center" onClick={toggle} onKeyDown={toggle} tabIndex="0">
              <WeeklySummary isPopup asUser={userId} />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col lg={{ size: 5 }} className="order-sm-12">
          <Leaderboard asUser={userId} />
        </Col>
        <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
          {popup ? <div className="my-2" ><div id="weeklySum"><WeeklySummary asUser={userId}/></div></div>: null}
          <div className="my-2"><a name="wsummary"></a>
            <Timelog isDashboard asUser={userId}/>
          </div>
          <div className="my-2">
            <TeamMemberTasks asUser={userId}/>
          </div>
          <Badge userId={userId} />
        </Col>

      </Row>
    </Container>
  ); 
}

const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps)(Dashboard);