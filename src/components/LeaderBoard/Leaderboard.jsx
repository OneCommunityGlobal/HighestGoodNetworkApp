import React, { Component, useEffect } from 'react'

import _ from 'lodash'
import { Link } from 'react-router-dom'
import Loading from '../common/Loading'

import getcolor from '../../utils/effortColors'
import { Table, Badge, Progress } from 'reactstrap'

const LeaderBoard = ({ getLeaderboardData, leaderBoardData, loggedInUser }) => {

	useEffect(() => {
		getLeaderboardData(loggedInUser.userid)
	}, [leaderBoardData.length])
	return (
		<Table>
			<thead>
				<tr>
					<th>Status</th>
					<th>Name</th>
					<th>intangibletime</th>
					<th>Progress</th>
					<th>totaltime</th>
				</tr>
			</thead>
			<tbody>
				{leaderBoardData.map((item, key) => (
					<tr key={key}>
						<td>
							<div
								style={{
									backgroundColor: item.tangiblebarcolor,
									width: 15,
									height: 15,
									borderRadius: 7.5
								}}></div>
						</td>
						<th scope='row'>
							<Link to={`/userprofile/${item.personId}`}>{item.name}</Link>
						</th>
						<td>{item.intangibletime}</td>
						<td>
							<Progress
								value={2 * 5}
								style={{ backgroundColor: item.tangiblebarcolor }}
							/>
						</td>
						<td>{item.totaltime}</td>
					</tr>
				))}
			</tbody>
		</Table>
	)
}

class Leaderboard1 extends Component {
	state = {
		leaderboardData: [],
		maxtotal: 0,
		isLoading: true
	}

	// getcolor = effort => {
	// 	let color = 'purple'
	// 	if (_.inRange(effort, 0, 5)) color = 'red'
	// 	if (_.inRange(effort, 5, 10)) color = 'orange'
	// 	if (_.inRange(effort, 10, 20)) color = 'green'
	// 	if (_.inRange(effort, 20, 30)) color = 'blue'
	// 	if (_.inRange(effort, 30, 40)) color = 'indigo'
	// 	if (_.inRange(effort, 40, 50)) color = 'violet'
	// 	return color
	// }

	// async componentDidMount() {
	// 	await this.props.state.auth.user
	// 	let user = this.props.state.auth.user
	// 	this.props.getLeaderboardData(user.userid)
	// }

	componentDidUpdate() {
		let data = this.props.state.leaderboardData
		if (data && this.state.isLoading === true) {
			let isLoading = false
			let maxtotal = 0
			let leaderboardData = []
			maxtotal = _.maxBy(data, 'totaltime_hrs').totaltime_hrs
			maxtotal = maxtotal === 0 ? 10 : maxtotal
			data.forEach(element => {
				leaderboardData.push({
					didMeetWeeklyCommitment:
						element.totaltangibletime_hrs >= element.weeklyComittedHours ? true : false,
					name: element.name,
					weeklycommited: _.round(element.weeklyComittedHours, 2),
					personId: element.personId,
					tangibletime: _.round(element.totaltangibletime_hrs, 2),
					intangibletime: _.round(element.totalintangibletime_hrs, 2),
					tangibletimewidth: _.round((element.totaltangibletime_hrs * 100) / maxtotal, 0),
					intangibletimewidth: _.round(
						(element.totalintangibletime_hrs * 100) / maxtotal,
						0
					),
					tangiblebarcolor: getcolor(element.totaltangibletime_hrs),
					totaltime: _.round(element.totaltime_hrs, 2)
				})
			})

			this.setState({ leaderboardData, maxtotal, isLoading })
		}
	}

	render() {
		let { leaderboardData, maxtotal, isLoading } = this.state
		let loggedinUser = this.props.state.auth.user.userid

		return (
			<div className='card hgn_leaderboard bg-dark'>
				<div className='card-body text-white'>
					<h5 className='card-title'>LeaderBoard</h5>
					{isLoading && <Loading />}
					{!isLoading && (
						<div>
							<table className='table table-sm dashboardtable'>
								<tbody>
									{leaderboardData.map(entry => {
										return (
											<tr
												key={entry.personId}
												className={
													entry.personId === loggedinUser ? 'table-active row' : 'row'
												}>
												<td className='col-1'>
													<i
														className='fa fa-circle'
														style={Object.assign({
															color: (() =>
																entry.didMeetWeeklyCommitment ? 'green' : 'red')()
														})}
														data-toggle='tooltip'
														data-placement='left'
														title={`Weekly Committed: ${entry.weeklycommited} hours\nTangibleEffort: ${entry.tangibletime} hours `}
													/>
												</td>
												<td className='text-left col-3'>
													<Link to={`/userprofile/${entry.personId}`}>{entry.name}</Link>
												</td>
												<td className='text-right text-justify text-nowrap col-2'>
													{entry.tangibletime} tan
												</td>
												<td className='col-4 text-center'>
													<Link to={`/timelog/${entry.personId}`}>
														<div className='progress progress-leaderboard'>
															<div
																className='progress-bar progress-bar-striped'
																role='progressbar'
																style={Object.assign({
																	width: entry.tangibletimewidth + '%',
																	backgroundColor: entry.tangiblebarcolor
																})}
																aria-valuenow={entry.tangibletime}
																aria-valuemin='0 '
																aria-valuemax={maxtotal}
																data-toggle='tooltip'
																data-placement='bottom'
																title={`Tangible Effort: ${entry.tangibletime} hours`}
															/>
															<div
																className='progress-bar progress-bar-striped bg-info'
																role='progressbar'
																style={{ width: entry.intangibletimewidth }}
																aria-valuenow={entry.intangibletime}
																aria-valuemin='0'
																aria-valuemax={maxtotal}
																data-toggle='tooltip'
																data-placement='bottom'
																title={`Intangible Effort: ${entry.intangibletime} hours`}
															/>
														</div>
													</Link>
												</td>
												<td className='text-right text-justify text-nowrap col-2'>
													{entry.totaltime} tot
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>
		)
	}
}

export default LeaderBoard
