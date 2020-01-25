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
		//console.log(this.props.userProfile)
		if (this.props.userProfile.firstName.length) {
			console.log(this.props.userProfile)
			this.setState({ isLoading: false, userProfile: this.props.userProfile })
		}
		//console.log(this.props.userProfile)
	}

	handleUserProfile = event => {
		event.preventDefault()
		if (event.target.id === 'firstName') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					firstName: event.target.value.trim()
				},
				showModal: event.target.value ? false : true,
				modalTitle: 'First Name Error',
				modalMessage: 'First Name cannot be empty'
			})
		}

		if (event.target.id === 'lastName') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					lastName: event.target.value.trim()
				},
				showModal: event.target.value ? false : true,
				modalTitle: 'First Name Error',
				modalMessage: 'Last Name cannot be empty'
			})
		}
		if (event.target.id === 'email') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					email: event.target.value.trim()
				},
				emailError: event.target.value ? '' : 'Email cannot be empty '
			})
		}
		if (event.target.id === 'phoneNumber') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					phoneNumber: event.target.value.trim()
				}
			})
		}
		if (event.target.id === 'jobTitle') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					jobTitle: event.target.value.trim()
				}
			})
		}
	}

	handleImageUpload = async e => {
		e.preventDefault()

		const file = e.target.files[0]

		const allowedTypesString = 'image/png,image/jpeg, image/jpg'
		const allowedTypes = allowedTypesString.split(',')
		let isValid = true
		let imageUploadError = ''
		if (!allowedTypes.includes(file.type)) {
			imageUploadError = `File type must be ${allowedTypesString}.`
			isValid = false

			return this.setState({
				imageUploadError,
				isValid,
				showModal: true,
				modalTitle: 'Profile Pic Error',
				modalMessage: imageUploadError
			})
		}
		let filesizeKB = file.size / 1024
		console.log(filesizeKB)

		if (filesizeKB > 50) {
			imageUploadError = `\nThe file you are trying to upload exceed the maximum size of 50KB. You can choose a different file or use an online file compressor.`
			isValid = false

			return this.setState({
				imageUploadError,
				isValid,
				showModal: true,
				modalTitle: 'Profile Pic Error',
				modalMessage: imageUploadError
			})
		}

		let reader = new FileReader()
		reader.readAsDataURL(file)
		reader.onloadend = () => {
			console.log(reader, file)

			this.setState({
				imageUploadError: '',
				userProfile: {
					...this.state.userProfile,
					profilePic: reader.result
				}
			})
		}
	}

	handleModelState = (status = true, type = 'message', linkType) => {
		console.log(linkType)
		this.setState({
			showModal: status,
			modalTitle: 'Add a New Link',
			linkType: linkType,
			type: type
		})
	}

	addLink = (linkName, linkURL, linkType) => {
		console.log('addLink', linkName, linkURL, linkType)

		const link = { Name: linkName, Link: linkURL }
		if (linkType !== 'Admin') {
			return this.setState(prevState => {
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						personalLinks: prevState.userProfile.personalLinks.concat(link)
					}
				}
			})
		}

		this.setState(prevState => {
			return {
				showModal: false,
				userProfile: {
					...this.state.userProfile,
					adminLinks: prevState.userProfile.adminLinks.concat(link)
				}
			}
		})
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
			firstName,
			lastName,
			email,
			profilePic = '',
			phoneNumber,
			jobTitle,
			personalLinks,
			adminLinks
		} = userProfile

		let isUserSelf = targetUserId === requestorId
		let canEditFields = isUserAdmin || isUserSelf
		const isUserAdmin = requestorRole === 'Administrator'

		if (isLoading === true) {
			return <Loading />
		}
		return (
			<Container className='themed-container' fluid={true}>
				<Modal
					isOpen={this.state.showModal}
					closeModal={() => {
						this.setState({ showModal: false })
					}}
					modalMessage={this.state.modalMessage}
					modalTitle={this.state.modalTitle}
					type={this.state.type}
					confirmModal={this.addLink}
					linkType={this.state.linkType}
				/>
				<Row>
					<Col
						xs={12}
						md={3}
						sm={12}
						style={{ backgroundColor: silverGray, border: '1px solid #A8A8A8' }}>
						<SideBar
							profilePic={profilePic}
							firstName={firstName}
							lastName={lastName}
							email={email}
							phoneNumber={phoneNumber}
							jobTitle={jobTitle}
							canEditFields={canEditFields}
							handleUserProfile={this.handleUserProfile}
							handleImageUpload={this.handleImageUpload}
						/>
						<Button outline color='primary' onClick={this.handleSubmit}>
							{'Save Changes'}
						</Button>
						<Button outline color='danger'>
							Cancel
						</Button>
						<br />
					</Col>
					<Col xs={12} md={9} sm={12} style={{ backgroundColor: 'white', padding: 5 }}>
						<WorkHistory />
						<br />
						<UserLinks
							linkType='Admin'
							links={adminLinks}
							handleModelState={this.handleModelState}
						/>
						<br />
						<UserLinks
							linkType='Social/Professional'
							addLink={this.addLink}
							links={personalLinks}
							handleModelState={this.handleModelState}
						/>
						<br />

						<Badges />
						<br />
					</Col>
				</Row>
			</Container>
		)
	}
}

export default UserProfile
