import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Alert, Card, Row, Col, Container } from 'reactstrap'
import MonthlyEffort from '../MonthlyEffort'
import Leaderboard from '../LeaderBoard'
import WeeklySummary from '../WeeklySummary'
import '../../App.css'
import TeamMemberTasks from '../TeamMemberTasks/TeamMemberTasks'
import { getUserProfile } from '../../actions/userProfile'

export class Dashboard extends Component {
  render() {
    console.log('')
    const userRole = this.props.state.userProfile.role
    console.log('userRole ', userRole)
    const userIsAdminOrManager = userRole === 'Administrator' || userRole === 'Manager'
    console.log('userIsAdminOrManager: ', userIsAdminOrManager)

    return (
      <Container fluisd>
        <Row>
          <Col sm={{ size: 12 }}>
            <Alert color="info">
              <b>Reminder</b>: Make sure to purge the cache or "hard" refresh the page in your
              browser if you don's see the changes you had merged with the "development" branch.
              This message will be removed before the site goes "live".
            </Alert>
          </Col>
          <Col lg={{ size: 9 }}>
            {userIsAdminOrManager ? <TeamMemberTasks /> : null}
            <WeeklySummary />
            <Leaderboard />
          </Col>
          <Col lg={{ size: 3 }}>
            <Card body inverse color="info">
              <MonthlyEffort />
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

const mapStateToProps = state => ({ state, userId: state.userProfile.id })

export default connect(mapStateToProps, { getUserProfile })(Dashboard)
