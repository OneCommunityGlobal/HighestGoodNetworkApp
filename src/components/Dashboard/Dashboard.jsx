import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Alert, Card, Row, Col, Container } from 'reactstrap'
import MonthlyEffort from '../MonthlyEffort'
import Leaderboard from '../LeaderBoard'
import '../../App.css'

class Dashboard extends Component {
	render() {
		return (
			<Container>
				<Row>
					<Col sm={{ offset: 1, size: 7 }}>
					    <Alert color="info">
					      <b>Reminder</b>
					      : Make sure to purge the cache or "hard" refresh the page in your browser if you don's see the changes you had merged with the "development" branch.
					      This message will be removed before the site goes "live".
					    </Alert>
						<Leaderboard />
					</Col>
					<Col sm={{ size: 3 }}>
						<Card body inverse color='info'>
							<MonthlyEffort />
						</Card>
					</Col>
				</Row>
			</Container>
		)
	}
}

const mapStateToProps = state => ({ state })

export default connect(mapStateToProps, {})(Dashboard)
