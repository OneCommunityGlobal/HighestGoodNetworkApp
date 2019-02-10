import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Row, CardTitle, CardText, Col } from "reactstrap";
import { getCurrentUser } from "../actions";
import { getjwt } from "../services/loginService";
import MonthlyEffort from "./MonthlyEffort";
import Leaderboard from "./Leaderboard";
import "../App.css";

class Dashboard extends Component {
  componentDidMount() {
    this.props.getCurrentUser(getjwt());
  }

  render() {
    return (
      <React.Fragment>
        <div>
          <Row>
            <Col sm={{ offset: 1, size: 7 }}>
              <Leaderboard />
            </Col>
            <Col sm={{ size: 3 }}>
              <Card body inverse color="info">
                <CardTitle>
                  <MonthlyEffort />
                </CardTitle>
                <CardText>
                  <div />
                </CardText>
              </Card>
            </Col>
          </Row>
          <Row style={{ marginTop: "20px" }}>
            <Col sm={{ offset: 1, size: 7 }}>
              <Card body inverse color="warning">
                <CardTitle>Badges</CardTitle>
              </Card>
            </Col>
          </Row>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({ state });

export default connect(
  mapStateToProps,
  { getCurrentUser }
)(Dashboard);
