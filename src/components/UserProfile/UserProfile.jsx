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
	Button
} from 'reactstrap'
import cx from 'classnames'
import Memberships from '../Memberships/Memberships'
import ProfileLinks from '../ProfileLinks/ProfileLinks'
import Joi from 'joi'
import ShowSaveWarning from '../common/ShowSaveWarning'
import Modal from '../common/Modal'

import Badges from './Badges'
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
	// componentWillUnmount() {
	//   this.props.clearUserProfile()
	// }

	// componentDidUpdate() {
	//   let userProfile = this.props.userProfile
	//   if (userProfile && this.state.isLoading === true) {
	//     this.setState({ isLoading: false })
	//   }
	// }

	teamsSchema = {
		_id: Joi.string().required(),
		teamName: Joi.string().required()
	}
	projectsSchema = {
		_id: Joi.string().required(),
		projectName: Joi.string().required()
	}

	activeOptions = [
		{ value: true, label: 'Active' },
		{ value: false, label: 'Inactive' }
	]

	allowedRoles = [
		{ _id: 'Administrator', name: 'Administrator' },
		{ _id: 'Core Team', name: 'Core Team' },
		{ _id: 'Manager', name: 'Manager' },
		{ _id: 'Volunteer', name: 'Volunteer' }
	]

	handleFirstNameChange = event => {
		this.setState({
			userProfile: {
				...this.state.userProfile,
				firstName: event.target.value.trim()
			},
			firstNameError: event.target.value ? '' : 'First Name cannot be empty '
		})
	}

	handleLastNameChange = event => {
		this.setState({
			userProfile: {
				...this.state.userProfile,
				lastName: event.target.value.trim()
			},
			lastNameError: event.target.value ? '' : 'Last Name cannot be empty '
		})
	}

	handleJobTitleChange = event => {
		this.setState({
			userProfile: {
				...this.state.userProfile,
				jobTitle: event.target.value
			}
		})
	}

	handlePhoneNumberChange = event => {
		this.setState({
			userProfile: {
				...this.state.userProfile,
				phoneNumber: event.target.value
			}
		})
	}
	handleEmailChange = event => {
		this.setState({
			userProfile: {
				...this.state.userProfile,
				email: event.target.value
			}
		})
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

			return this.setState({ imageUploadError, isValid })
		}
		let filesizeKB = file.size / 1024
		console.log(filesizeKB)

		if (filesizeKB > 50) {
			imageUploadError = `\nThe file you are trying to upload exceed the maximum size of 50KB. You can choose a different file or use an online file compressor.`
			isValid = false
			return this.setState({ imageUploadError, isValid })
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
				modalTitle: 'Success'
			})
		} else {
			this.setState({
				showModal: true,
				modalMessage: 'Please try again.',
				modalTitle: 'Error'
			})
		}
	}

	render() {
		if (this.state.isLoading === true) {
			return <Loading />
		}

		let { userId: targetUserId } = this.props.match.params
		let { userid: requestorId, role: requestorRole } = this.props.user

		const {
			firstName,
			lastName,
			profilePic = '',
			phoneNumber,
			jobTitle
		} = this.state.userProfile
		const { firstNameError, lastNameError, imageUploadError, error } = this.state

		console.log('state is ', this.state)
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

		let isUserSelf = targetUserId === requestorId
		let canEditFields = isUserAdmin || isUserSelf
		const isUserAdmin = requestorRole === 'Administrator'

		return (
			<Container>
				<Modal
					isOpen={this.state.showModal}
					closeModal={() => {
						this.setState({ showModal: false })
					}}
					modalMessage={this.state.modalMessage}
					modalTitle={this.state.modalTitle}
				/>
				<div className='row my-auto'>
					<div className='col-md-4'>
						<div className='form-row text-center'>
							<div className={`form-group profilepic`}>
								<label htmlFor={'currentprofilePic'}>{}</label>
								<img
									type='image'
									id='currentprofilePic'
									name='currentprofilePic'
									alt={'currentprofilePic'}
									className={`img-responsive profilepic`}
									src={profilePic || '/defaultprofilepic.jpg'}
								/>

								{error && <div className='alert alert-danger mt-1'>{error}</div>}
							</div>
							{canEditFields && (
								<React.Fragment>
									<label
										htmlFor={'profilePic'}
										className='fa fa-edit'
										data-toggle='tooltip'
										data-placement='bottom'
										title={''}></label>
									<input
										id={'profilePic'}
										name={'profilePic'}
										className={'newProfilePic'}
										onChange={this.handleImageUpload}
										accept={'image/png,image/jpeg, image/jpg'}
										type='file'
									/>

									{imageUploadError && (
										<div className='alert alert-danger mt-1'>{imageUploadError}</div>
									)}
								</React.Fragment>
							)}
						</div>
					</div>
					<div className='col-md-8'>
						<div className='form-row'>
							<div className={cx('form-group', 'col-md-4')}>
								<label htmlFor='firstName'>First Name:</label>
								<input
									id={'firstName'}
									type='text'
									name={'firstName'}
									className={`form-control`}
									value={firstName}
									readOnly={canEditFields ? null : true}
									onChange={this.handleFirstNameChange}
								/>
								{firstNameError && (
									<div className='alert alert-danger mt-1'>{firstNameError}</div>
								)}
							</div>
							<div className={cx('form-group', 'col-md-4')}>
								<label htmlFor='lastName'>Last Name:</label>
								<input
									id={'lastName'}
									type='text'
									name={'lastName'}
									className={`form-control`}
									value={lastName}
									readOnly={canEditFields ? null : true}
									onChange={this.handleLastNameChange}
								/>
								{lastNameError && (
									<div className='alert alert-danger mt-1'>{lastNameError}</div>
								)}
							</div>
							<div className='form-group'>
								{this.activeOptions.map(item => (
									<div className='form-check form-check-inline' key={item.value}>
										<input
											type='radio'
											value={item.value}
											name={'isActive'}
											className='form-check-input'
											checked={item.value === isActive ? true : null}
											disabled={canEditFields ? null : true}
										/>
										<label htmlFor={item.value.toString()} className='form-check-label'>
											{item.label}
										</label>
									</div>
								))}

								{error && <div className='alert alert-danger'>{error}</div>}
							</div>
						</div>
						<div className='form-row'>
							<div className={cx('form-group', 'col-md-4')}>
								<label htmlFor='email'>Job Title:</label>
								<input
									id={'jobTitle'}
									type='text'
									name={'jobTitle'}
									className={`form-control`}
									value={jobTitle}
									readOnly={canEditFields ? null : true}
									onChange={this.handleJobTitleChange}
								/>
								{error && <div className='alert alert-danger mt-1'>{error}</div>}
							</div>

							<div className={cx('form-group', 'col-md-4')}>
								<label htmlFor={'role'}>Role:</label>

								<select
									value={role}
									name={'role'}
									id={'role'}
									readOnly={canEditFields ? null : true}
									className='form-control'>
									<option value=''>Please select a Role:</option>
									{this.allowedRoles.map(item => (
										<option value={item._id} key={item._id}>
											{item.name}
										</option>
									))}
								</select>
								{error && <div className='alert alert-danger'>{error}</div>}
							</div>

							<div className={cx('form-group', 'col-md-4')}>
								<label htmlFor='weeklyComittedHours'>Weekly Comitted Hours:</label>
								<input
									id={'weeklyComittedHours'}
									type='number'
									name={'weeklyComittedHours'}
									className={`form-control`}
									value={weeklyComittedHours}
									readOnly={isUserAdmin ? null : true}
								/>
								{error && <div className='alert alert-danger mt-1'>{error}</div>}
							</div>
						</div>
					</div>
				</div>

				{<ShowSaveWarning />}

				<Row>
					<Col xs='6'>
						<Card body>
							<CardHeader>Phone Number:</CardHeader>
							<CardBody>
								<CardText>
									<Input value={phoneNumber} onChange={this.handlePhoneNumberChange} />
								</CardText>
							</CardBody>
							<CardFooter>
								<InputGroup size='sm'>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											<Input
												addon
												type='checkbox'
												aria-label='Checkbox for following text input'
											/>
											Publicly Accessible?
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</CardFooter>
						</Card>
					</Col>
					<Col xs='6'>
						<Card body>
							<CardHeader>Email</CardHeader>
							<CardBody>
								<CardText>
									<Input value={email} type='email' />
								</CardText>
							</CardBody>
							<CardFooter>
								<InputGroup size='sm'>
									<InputGroupAddon addonType='prepend'>
										<InputGroupText>
											<Input
												addon
												type='checkbox'
												aria-label='Checkbox for following text input'
											/>
											Publicly Accessible?
										</InputGroupText>
									</InputGroupAddon>
								</InputGroup>
							</CardFooter>
						</Card>
					</Col>
				</Row>

				<div className='row mt-3'>
					<ProfileLinks
						canEdit={isUserAdmin}
						data={adminLinks}
						label='Admin'
						handleProfileLinks={this.handleCollection}
						collection='adminLinks'
					/>
				</div>
				<div className='row mt-3'>
					<ProfileLinks
						canEdit={canEditFields}
						data={personalLinks}
						label='Social/Professional'
						// handleProfileLinks={this.handleCollection}
						collection='personalLinks'
					/>
				</div>

				<Badges />

				<div className='row mt-3'>
					<div className='col-6'>
						<Memberships
							schema={this.teamsSchema}
							canEdit={isUserAdmin}
							data={teams}
							label='Team'
							collection='teams'
							//handleDelete={this.handleCollection}
							// handleBulkUpdates={this.handleMemberships}
						/>
					</div>
					<div className='col-6'>
						<Memberships
							schema={this.projectsSchema}
							canEdit={isUserAdmin}
							data={projects}
							label='Project'
							collection='projects'
							//handleDelete={this.handleCollection}
							//handleBulkUpdates={this.handleMemberships}
						/>
					</div>
				</div>
				<button className='btn btn-primary' onClick={this.handleSubmit}>
					{'Submit'}
				</button>
			</Container>
		)
	}
}

export default UserProfile
