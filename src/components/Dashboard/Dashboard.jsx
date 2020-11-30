import React from 'react';
import { Alert, Row, Col, Container } from 'reactstrap';
import Leaderboard from '../LeaderBoard';
import WeeklySummaryModal from '../WeeklySummary/WeeklySummaryModal';
import Badge from '../Badge';
import TeamMemberTasks from '../TeamMemberTasks/TeamMemberTasks'
import Timelog from '../Timelog/Timelog';
import '../../App.css';
import { connect } from 'react-redux';

const Dashboard = props => (
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
    <Row>
      <Col lg={{ size: 7 }}>&nbsp;</Col>
      <Col lg={{ size: 5 }}>
        <WeeklySummaryModal />
      </Col>
    </Row>
    <Row>
      <Col lg={{ size: 5 }} className="order-sm-12">
        <Leaderboard />
      </Col>
      <Col lg={{ size: 7 }} className="left-col-dashboard order-sm-1">
        <div className="my-2">
          <Timelog/>
        </div>
        <div className="my-2">
          <TeamMemberTasks />
        </div>
        <Badge userId={props.auth.user.userid} />
      </Col>

    </Row>
  </Container >
);

const mapStateToProps = state => ({
  auth: state.auth,
})

export default connect(mapStateToProps)(Dashboard);