import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getAllProjects, postTimeEntry } from '../../actions'
import { Card, Row, CardTitle, CardText, Col, Container } from 'reactstrap'
import MonthlyEffort from '../MonthlyEffort'
import Leaderboard from '../LeaderBoard'
import '../../App.css'

class Dashboard extends Component {
	componentDidMount() {
		// this.props.auth.user
	}

	render() {
		return (
			<Container>
				<Row>
					<Col sm={{ offset: 1, size: 7 }}>
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

const mapStateToProps = state => {
	return { state }
}

export default connect(mapStateToProps, {})(Dashboard)
