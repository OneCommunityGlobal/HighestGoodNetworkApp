import React, { Component } from 'react'
import Loading from '../common/Loading'
import {
	Card,
	Row,
	CardTitle,
	CardText,
	Col,
	Container,
	CardSubtitle,
	CardBody,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	CardHeader,
	CardFooter,
	Badge,
	Button,
	FormGroup,
	Label,
	CardImg
} from 'reactstrap'
import { orange, silverGray } from '../../constants/colors'
import cx from 'classnames'
import Memberships from '../Memberships/Memberships'
import ProfileLinks from '../ProfileLinks/ProfileLinks'
import Joi from 'joi'
import ShowSaveWarning from '../common/ShowSaveWarning'
import Modal from '../common/Modal'

import Badges from './Badges'
import WorkHistory from './WorkHistory'
import UserLinks from './UserLinks'

import SideBar from './SideBar'

class UserProfile extends Component {
	state = {
		isLoading: true,
		error: '',
		userProfile: {},
		firstNameError: '',
		lastNameError: '',
		imageUploadError: '',
		isValid: false
	}

	async componentDidMount() {
		// this.props.getCurrentUser(getjwt())
		let userId = this.props.match.params.userId
		await this.props.getUserProfile(userId)
		await this.props.getUserTeamMembers(userId)
		console.log(this.props.userProfile)
		if (this.props.userProfile.firstName.length) {
			console.log(this.props.userProfile)
			this.setState({ isLoading: false, userProfile: this.props.userProfile })
		}
		//console.log(this.props.userProfile)
	}
	render() {
		let { userId: targetUserId } = this.props.match.params
		let { userid: requestorId, role: requestorRole } = this.props.auth.user

		const {
			userProfile,
			isLoading,
			firstNameError,
			lastNameError,
			imageUploadError,
			error
		} = this.state
		const {
			teams,
			projects,
			personalLinks,
			adminLinks,
			email,
			isActive,
			weeklyComittedHours,
			role
		} = this.props

		const { firstName, lastName, profilePic = '', phoneNumber, jobTitle } = userProfile

		let isUserSelf = targetUserId === requestorId
		let canEditFields = isUserAdmin || isUserSelf
		const isUserAdmin = requestorRole === 'Administrator'

		if (isLoading === true) {
			return <Loading />
		}
		return (
			<Container className='themed-container' fluid={true}>
				<Row>
					<Col xs={12} md={3} sm={12} style={{ backgroundColor: silverGray }}>
						<SideBar />
					</Col>
					<Col xs={12} md={9} sm={12} style={{ backgroundColor: 'white', padding: 5 }}>
						<WorkHistory />
						<hr />
						<UserLinks type='Admin' />
						<hr />
						<UserLinks type='Social/Professional' />
						<hr />

						<Badges />
					</Col>
				</Row>
			</Container>
		)
	}
}

export default UserProfile
