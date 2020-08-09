import React, { Component } from 'react'
import Loading from '../../common/Loading'
import {
	Row,
	Label,
	Input,
	CardTitle,
	Col,
	Container,
	Button,
	Badge,
	Collapse,
} from 'reactstrap'
import Image from 'react-bootstrap/Image'
import { orange, warningRed } from '../../../constants/colors'
import BlueSquare from '../BlueSquares'
import Modal from '../UserProfileModal'
import UserLinks from '../UserLinks'
import styleProfile from '../UserProfile.css'
import styleEdit from './UserProfileEdit.css'
import styleSwitch from './ToggleSwitch.css'


class EditProfile extends Component {
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
					currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp
				}
				if (summary != null) {
					currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary
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
					if (blueSquare._id !== id) {
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
				type: 'save'
			})
			var elem = document.getElementById('warningCard');
			elem.style.display = 'none';
		} else {
			this.setState({
				showModal: true,
				modalMessage: 'Please try again.',
				modalTitle: 'Error',
				type: 'save'
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
				<button
					className={'modLinkButton'}
					onClick={() => { this.handleLinkModel(true, 'updateLink', user) }}>
					<i class="fa fa-wrench fa-lg" aria-hidden="true"> </i>
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
		} = userProfile

		let isUserSelf = targetUserId === requestorId
		const isUserAdmin = requestorRole === 'Administrator'
		let canEditFields = isUserAdmin || isUserSelf

		if (isLoading === true) {
			return <Loading />
		}

		return (
			<div style={{ display: 'flex' }}>

				<CardTitle id="warningCard" className={'saveChangesWarning'}>
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

				<Col>
					<Row className={'profileContainer'}>
						<div className='whoSection'>
							<Label for='newProfilePic' htmlFor={'newProfilePic'} className={'profileEditTitleCenter'}>
								Change Profile Picture
							</Label>
							<Input
								type='file'
								name='newProfilePic'
								id={'newProfilePic'}
								style={{ visibility: 'hidden', width: 0, height: 0 }}
								onChange={this.handleImageUpload}
								accept={'image/png,image/jpeg, image/jpg'}
							/>
							<div>
								<Image src={profilePic || '/defaultprofilepic.png'}
									alt='Profile Picture'
									roundedCircle
									className='profilePicture'
								/>
							</div>
							<div className='inputSections'>
								<Label className={'profileEditTitle'}>Name:</Label>
								<Input type='text' name='firstName' id='firstName'
									value={firstName}
									className={'profileText'}
									onChange={this.handleUserProfile}
									placeholder='First Name'
									readOnly={canEditFields ? null : true}
								/>
								<Input type='text' name='lastName' id='lastName'
									value={lastName}
									className={'profileText'}
									onChange={this.handleUserProfile}
									placeholder='Last Name'
									readOnly={canEditFields ? null : true}
								/>
								<Label className={'profileEditTitle'}>Title:</Label>
								<Input type='title' name='jobTitle' id='jobTitle'
									value={jobTitle}
									className={'profileText'}
									onChange={this.handleUserProfile}
									placeholder='Job Title'
									readOnly={canEditFields ? null : true}
								/>					


								<div className={'blueSquareSection'}>
									Blue Squares Publicly Viewable:
									<label class="switch">
										<input type="checkbox" />
										<span class="slider round"></span>
									</label>
								</div>
								
								<BlueSquare
									isUserAdmin={isUserAdmin}
									blueSquares={infringments}
									handleBlueSquare={this.handleBlueSquare}
									handleSaveError={this.handleSaveError}
								/>	
								<br />
							</div>

						</div>

						<div className='detailSection'>
							<div className='inputSections'>
								<Label className={'profileEditTitle'}>Email:</Label>
								<Input
									type='email'
									name='email'
									id='email'
									className={'profileText'}
									value={email}
									onChange={this.handleUserProfile}
									placeholder='Email'
									readOnly={canEditFields ? null : true}
								/>
								<Label className={'profileEditTitle'}>Phone:</Label>
								<Input
									type='number'
									name='phoneNumber'
									id='phoneNumber'
									className={'profileText'}
									value={phoneNumber}
									onChange={this.handleUserProfile}
									placeholder='Phone'
									readOnly={canEditFields ? null : true}
								/>

								<div>
									<Label className={'profileEditTitle'}>Links:</Label>
									<div className={'profileLinks'}>
										{this.modLinkButton(canEditFields, isUserAdmin)}
										<UserLinks
											linkSection='admin'
											links={adminLinks}
											handleLinkModel={this.handleLinkModel}
											isUserAdmin={isUserAdmin}
											canEditFields={canEditFields}
										/>
									</div>

									<div className={'profileLinks'}>
										<UserLinks
											linkSection='user'
											links={personalLinks}
											handleLinkModel={this.handleLinkModel}
											isUserAdmin={isUserAdmin}
											canEditFields={canEditFields}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className={'profileViewButtonContainer'}>
							<Badge className={'profileViewButton'} href={'/userprofile/' + this.state.userProfile._id}>
								<i class="fa fa-eye fa-lg" aria-hidden="true"> View</i>
							</Badge>
						</div>

					</Row>

					<Row style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 5 }}>
						<Button outline color='primary' onClick={this.handleSubmit} style={{ display: 'flex', margin: 5 }}>
							{'Save Changes'}
						</Button>
						<Button outline color='danger' onClick={() => window.location.reload()} style={{ display: 'flex', margin: 5 }} >
							Cancel
						</Button>
					</Row>

				</Col>
			</div>
		)

	}
}

export default EditProfile
