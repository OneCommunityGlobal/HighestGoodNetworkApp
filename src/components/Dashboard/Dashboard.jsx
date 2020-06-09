import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Card, Row, Col, Container,
} from 'reactstrap';
import MonthlyEffort from '../MonthlyEffort';
import Leaderboard from '../LeaderBoard';
import WeeklySummary from '../WeeklySummary';
import '../../App.css';

class Dashboard extends Component {
  render() {
    return (
      <Container fluid>
        <Row>
          <Col sm={{ size: 9 }}>
            <WeeklySummary />
            <Leaderboard />
          </Col>
          <Col sm={{ size: 3 }}>
            <Card body inverse color="info">
              <MonthlyEffort />
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(mapStateToProps, {})(Dashboard);
