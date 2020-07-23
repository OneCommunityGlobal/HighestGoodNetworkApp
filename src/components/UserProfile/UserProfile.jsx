import React, { Component } from 'react'
import Loading from '../common/Loading'
import {
	Card,
	Row,
	Label,
	Input,
	CardTitle,
	Col,
	Container,
	Button,
} from 'reactstrap'

import Image from 'react-bootstrap/Image'

import { orange, silverGray, warningRed } from '../../constants/colors'
import cx from 'classnames'
import Memberships from '../Memberships/Memberships'
import ProfileLinks from '../ProfileLinks/ProfileLinks'
import Joi from 'joi'
import BlueSquare from './BlueSquares'
import Modal from './UserProfileModal'

import Badges from './Badges'
import WorkHistory from './WorkHistory'
import UserLinks from './UserLinks'

import SideBar from './SideBar'
import SideBarRedo from './SideBar_old'
import { method } from 'lodash'


class UserProfile extends Component {
	state = {
		isLoading: true,
		error: '',
		userProfile: {},
		firstNameError: '',
		lastNameError: '',
		imageUploadError: '',
		isValid: false,
		id: ''
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
	}

	handleUserProfile = event => {

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
			this.setState({
				userProfile: {
					...this.state.userProfile,
					privacySettings: {
						...this.state.userProfile.privacySettings,
						phoneNumber: !this.state.userProfile.privacySettings.phoneNumber
					}
				}
			})
		}

		if (event.target.id === 'blueSquaresPubliclyAccessible') {

			this.setState({
				userProfile: {
					...this.state.userProfile,
					privacySettings: {
						...this.state.userProfile.privacySettings,
						blueSquares: !this.state.userProfile.privacySettings.blueSquares
					}
				}
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

	handleNullState = (kind) => {

		if (kind === 'settings') {
			const defaultSettings = {
				email: true,
				phoneNumber: true,
				blueSquares: true
			}

			this.setState(() => {
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						privacySettings: defaultSettings
					}
				}
			})

		}

	}

	handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
		if (type === 'addBlueSquare') {
			this.setState({
				showModal: status,
				modalTitle: 'Blue Square',
				type: type
			})
		} else if (type === 'modBlueSquare') {
			this.setState({
				showModal: status,
				modalTitle: 'Blue Square',
				type: type,
				id: blueSquareID
			})
		} else if (type === 'viewBlueSquare') {
			this.setState({
				showModal: status,
				modalTitle: 'Blue Square',
				type: type,
				id: blueSquareID
			})
		} else if (blueSquareID === 'none') {
			this.setState({
				showModal: status,
				modalTitle: 'Save & Refresh',
				modalMessage: '',
				type: type
			})
		}

	}

	updateBlueSquare = (id, dateStamp, summary, kind) => {
		// console.log('Handle Blue Square: ', kind, ' date:', dateStamp, ' summary:', summary)
		var elem = document.getElementById('warningCard');
		elem.style.display = 'block';

		if (kind === 'add') {
			let newBlueSquare = { date: dateStamp, description: summary }
			this.setState(prevState => {
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						infringments: prevState.userProfile.infringments.concat(newBlueSquare)
					}
				}
			})
		} else if (kind === 'update') {
			this.setState(() => {
				let currentBlueSquares = this.state.userProfile.infringments
				if (dateStamp != null) {
					currentBlueSquares.find(blueSquare => blueSquare._id == id).date = dateStamp
				}
				if (summary != null) {
					currentBlueSquares.find(blueSquare => blueSquare._id == id).description = summary
				}
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						infringments: currentBlueSquares
					}
				}
			})
		} else if (kind === 'delete') {
			this.setState(() => {
				var currentBlueSquares = this.state.userProfile.infringments.filter(function (blueSquare) {
					if (blueSquare._id != id) {
						return blueSquare
					}
				})
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						infringments: currentBlueSquares
					}
				}

			})
		}

	}

	handleSaveError = (message) => {
		this.setState({
			showModal: true,
			modalMessage: 'Must save first.',
			modalTitle: 'Error, ' + message,
			type: 'message'
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

	updateLink = (personalLinksUpdate, adminLinksUpdate) => {
		var elem = document.getElementById('warningCard');
		elem.style.display = 'block';
		
		return this.setState(() => {
				return {
					showModal: false,
					userProfile: {
						...this.state.userProfile,
						personalLinks: personalLinksUpdate,
						adminLinks: adminLinksUpdate
					}
				}
		})
	}

	handleLinkModel = (status = true, type = 'message', linkSection) => {
		if (type === 'addLink') {
			this.setState({
				showModal: status,
				modalTitle: 'Add a New Link',
				linkType: linkSection,
				type: type
			})
		} else if (type === 'updateLink') {
			this.setState({
				showModal: status,
				modalTitle: 'Edit Links',
				linkType: linkSection,
				type: type
			})
		}
	}

	modLinkButton = (canEditFields, isUserAdmin) => {
		if (canEditFields) {
			let user = 'user'
			if (isUserAdmin) {
				user = 'admin'
			}
			return (
				<button style={{
					display: 'flex', width: '25px', height: '25px', padding: '0px',
					alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', border: 'none'
				}}
					onClick={() => { this.handleLinkModel(true, 'updateLink', user) }}>
					<svg style={{ width: '20px', height: '20px' }} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
						<path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456l-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
						<path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
					</svg>
				</button>

			)
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
						updateLink={this.updateLink}
						updateBlueSquare={this.updateBlueSquare}
						linkType={this.state.linkType}
						userProfile={this.state.userProfile}
						id={this.state.id}
						isUserAdmin={isUserAdmin}
						handleLinkModel={this.handleLinkModel}
					/>
				)}

				<Col style={{ height: '100%', backgroundColor: 'white' }}>
					<Row style={{ color: 'white', backgroundColor: 'grey', padding: 10, margin: 5}}>
						<Col>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

								<Input
									type='file'
									name='newProfilePic'
									id={'newProfilePic'}
									style={{ visibility: 'hidden', width: 0, height: 0 }}
									onChange={this.handleImageUpload}
									accept={'image/png,image/jpeg, image/jpg'}
								/>
								
								<Image src={profilePic || '/defaultprofilepic.png'}
									alt='Profile Picture'
									roundedCircle
									style={{ width: '200px', height: '200px' }}
								/>

								<br/>

								<div>
									<Label>{firstName} {lastName}</Label>
								</div>

								<div>
									<Label>{jobTitle}</Label>
								</div>

								<BlueSquare 
									isUserAdmin={isUserAdmin}
									blueSquares={infringments}
									handleBlueSquare={this.handleBlueSquare}
									handleSaveError={this.handleSaveError}
								/>

							</div>
						</Col>
					

						<Col>

							<Col> 
									<Label>{email}</Label>
								</Col>

								<Col>
									<Label>{phoneNumber}</Label>
							</Col>

							<div style={{ width: '80%', display: 'flex', alignItems: 'center', padding: 5 }}>
								<UserLinks
									linkSection='admin'
									links={adminLinks}
									handleLinkModel={this.handleLinkModel}
									isUserAdmin={isUserAdmin}
									canEditFields={canEditFields}
								/>
							</div>

							<div style={{ display: 'flex', alignItems: 'center', padding: 5 }}>
								<UserLinks
									linkSection='user'
									links={personalLinks}
									handleLinkModel={this.handleLinkModel}
									isUserAdmin={isUserAdmin}
									canEditFields={canEditFields}
								/>
							</div>
						

						
						</Col>


						{/* {this.modLinkButton(canEditFields, isUserAdmin)} */}
					
					</Row>
					<br />

					{/* <Button outline color='primary' onClick={this.handleSubmit}>
					{'Save Changes'}
					</Button>
					<Button outline color='danger' onClick={() => window.location.reload()}>
						Cancel
					</Button> */}
					
				</Col>

			</Container>
		)

	}
}

export default UserProfile
