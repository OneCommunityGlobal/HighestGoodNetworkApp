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
import { orange, silverGray, warningRed } from '../../constants/colors'
import cx from 'classnames'
import Memberships from '../Memberships/Memberships'
import ProfileLinks from '../ProfileLinks/ProfileLinks'
import Joi from 'joi'
import BlueSquare from './BlueSquares'
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
		if (this.props.match) {
			let userId = this.props.match.params.userId
			await this.props.getUserProfile(userId)
			await this.props.getUserTeamMembers(userId)
			//console.log(this.props.userProfile)
			if (this.props.userProfile.firstName.length) {
				//	console.log(this.props.userProfile)
				this.setState({ isLoading: false, userProfile: this.props.userProfile })
			}
		}
		// console.log(this.props.userProfile)
	}

	// refreshProfile = async() => {
	// 	let userId = this.props.match.params.userId

	// 	try {
	// 		const newProfile = await this.props.getUserProfile(userId)
	// 		this.setState({
	// 			userProfile: newProfile
	// 		})
	// 	} catch (error) {
	// 		// show error here, like modal error
	// 	}
	// }

	handleUserProfile = event => {
		console.log('handleUserProfile............')


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

		if (event.target.id === 'jobTitle') {
			this.setState({
				userProfile: {
					...this.state.userProfile,
					jobTitle: event.target.value
				}
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

		if (event.target.id === 'emailPubliclyAccessible') {
			
			const newValue =  event.target.checked
			
			console.log(this.state)

			this.setState({
				userProfile: {
					...this.state.userProfile,
					privacySettings: {
						...this.state.userProfile.privacySettings,
						email: !this.state.userProfile.privacySettings.email
					}
				}
			})

		}

		if (event.target.id === 'phoneNumberPubliclyAccessible') {
			this.setState(prevState => {
				var newPrivacySettings = prevState.userProfile.privacySettings
				newPrivacySettings.phoneNumber = !newPrivacySettings.phoneNumber
				
				this.setState({
					userProfile: {
						...this.state.userProfile,
						privacySettings: newPrivacySettings,
					}
				})

			})
		}

		var elem = document.getElementById('warningCard');
		elem.style.display = 'block';

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
				type: 'image',
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
			imageUploadError = `\nThe file you are trying to upload exceeds the maximum size of 50KB. You can either 
														choose a different file, or use an online file compressor.`
			isValid = false

			return this.setState({
				type: 'image',
				imageUploadError,
				isValid,
				showModal: true,
				modalTitle: 'Profile Pic Error',
				modalMessage: imageUploadError,
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

	handleBlueSquare = (status = true, type = 'message') => {
		
		if (type === 'addBlueSquare'){
			this.setState({
				showModal: status,
				modalTitle: 'Blue Square',
				type: type
			})
		}else{
			console.log('delete blue square...')
		}

	}

	addLink = (linkName, linkURL, linkSection) => {
		console.log('addLink', linkName, linkURL, linkSection)

		var elem = document.getElementById('warningCard');
		elem.style.display = 'block';

		const link = { Name: linkName, Link: linkURL }
		if (linkSection == 'user') {
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

	removeLink = (linkSection, item) => {

		if (linkSection === 'user') {
			return this.setState(prevState => {
				var prevLinks = prevState.userProfile.personalLinks
				var newLinks = prevLinks.filter(function(arrayItem) {
					if (arrayItem != item){
						return arrayItem
					}
				});

				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						personalLinks: newLinks
					}
				}
			})
		}

		return this.setState(prevState => {
			var prevLinks = prevState.userProfile.adminLinks
			var newLinks = prevLinks.filter(function(arrayItem) {
				if (arrayItem != item){
					return arrayItem
				}
			});

			return {
				showModal: false,
				userProfile: {
					...this.state.userProfile,
					adminLinks: newLinks
				}
			}
		})



	}

	addInfringment = (dateStamp, report) => {

		let newInfringment = { date: dateStamp, description: report}

		this.setState(prevState => {
			return {
				showModal: false,
				userProfile: {
					...this.state.userProfile,
					infringments: prevState.userProfile.infringments.concat(newInfringment)
				}
			}
		})

	}

	
	handleSubmit = async event => {
		event.preventDefault()

		const submitResult = await this.props.updateUserProfile(
			this.props.match.params.userId,
			this.state.userProfile
		)
		console.log(submitResult)

		if (submitResult === 200) {
			this.setState({
				showModal: true,
				modalMessage: 'Your Changes were saved successfully',
				modalTitle: 'Success',
				type: 'message'
			})
			var elem = document.getElementById('warningCard');
			elem.style.display = 'none';
		} else {
			this.setState({
				showModal: true,
				modalMessage: 'Please try again.',
				modalTitle: 'Error',
				type: 'message'
			})
		}
	}

	render() {

		let { userId: targetUserId } = this.props.match ? this.props.match.params : { userId: undefined };
		let { userid: requestorId, role: requestorRole } = this.props.auth.user

		const { userProfile, isLoading, showModal } = this.state

		const {
			firstName,
			lastName,
			email,
			profilePic,
			phoneNumber,
			jobTitle = '',
			personalLinks,
			adminLinks,
			infringments,
			privacySettings,
		} = userProfile

		let isUserSelf = targetUserId === requestorId
		const isUserAdmin = requestorRole === 'Administrator'
		let canEditFields = isUserAdmin || isUserSelf

		if (isLoading === true) {
			return <Loading />
		}

		// if (canEditFields) {
			return (
				<Container className='themed-container' fluid={true}>

					<CardTitle
						id="warningCard"
						className='themed-container'
						style={{
							position: 'fixed', top: '7vh', left: '0', width: '100%',
							color: 'white', backgroundColor: warningRed,
							border: '1px solid #A8A8A8', textAlign: "center", display: 'none', zIndex: 2, opacity: '70%'
						}}
					>
						Reminder: You must click "Save Changes" at the bottom of this page. If you don't, changes to your profile will not be saved.
					</CardTitle>


					{showModal && (
						<Modal
							isOpen={this.state.showModal}
							closeModal={() => {
								this.setState({ showModal: false })
							}}
							modalMessage={this.state.modalMessage}
							modalTitle={this.state.modalTitle}
							type={this.state.type}
							confirmModal={this.addLink}
							confirmInfringment={this.addInfringment}
							linkType={this.state.linkType}
							infringments={this.state.infringments}
						/>
					)}

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
								privacySettings={privacySettings}
								canEditFields={canEditFields}
								isUserAdmin={isUserAdmin}
								infringments={infringments}
								handleUserProfile={this.handleUserProfile}
								handleImageUpload={this.handleImageUpload}
								handleBlueSquare={this.handleBlueSquare}
							/>

							<br />
						</Col>

						<Col xs={12} md={9} sm={12} style={{ backgroundColor: 'white', padding: 5 }}>
							<WorkHistory />

							<br />
							<UserLinks
								linkSection='admin'
								linkSectionName='Google Doc'
								links={adminLinks}
								handleModelState={this.handleModelState}
								isUserAdmin={isUserAdmin}
								canEditFields={canEditFields}
								removeLink={this.removeLink}
							/>

							<br />
							<UserLinks
								linkSection='user'
								linkSectionName='Social/Professional'
								links={personalLinks}
								handleModelState={this.handleModelState}
								isUserAdmin={isUserAdmin}
								canEditFields={canEditFields}
								removeLink={this.removeLink}
							/>
							<br />

							<Badges />

							<br />
							<Button outline color='primary' onClick={this.handleSubmit}>
								{'Save Changes'}
							</Button>

							<Button outline color='danger' onClick={() => window.location.reload()}>
								Cancel
							</Button>

						</Col>
					</Row>

				</Container>
			)
		// } else {
		// 	return (
		// 		<Container className='themed-container' fluid={true}>
		// 			Hello User who does not own this profile

		// 		</Container>
		// 	)
		// }


	}
}

export default UserProfile
