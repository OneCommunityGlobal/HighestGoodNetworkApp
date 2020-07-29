import React, { Component } from 'react'
import Loading from '../common/Loading'
import {
	Row,
	Label,
	Input,
	Badge,
	Col,
	Container,
} from 'reactstrap'
import Image from 'react-bootstrap/Image'
import { orange, silverGray, warningRed } from '../../constants/colors'
import BlueSquare from './BlueSquares'
import Modal from './UserProfileModal'
import UserLinks from './UserLinks'
import './UserProfile.css'

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
		if (this.props.match) {
			let userId = this.props.match.params.userId
			await this.props.getUserProfile(userId)
			await this.props.getUserTeamMembers(userId)
			if (this.props.userProfile.firstName.length) {
				this.setState({ isLoading: false, userProfile: this.props.userProfile })
			}
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
			<div style={{display: 'flex'}}>
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
					<Row style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', color: 'white', backgroundColor: 'grey', padding: 10, margin: 10 }}>
						<div className='whoSection'>
							<div>
								<Image src={profilePic || '/defaultprofilepic.png'}
									alt='Profile Picture'
									roundedCircle
									className='profilePicture'
								/>
							</div>
							<Label>{firstName} {lastName}</Label>
							<Label>{jobTitle}</Label>
							<BlueSquare
								isUserAdmin={false}
								blueSquares={infringments}
								handleBlueSquare={this.handleBlueSquare}
							/>
						</div>


						<div className='detailSection'>
							<Label>{email}</Label>
							<Label>{phoneNumber}</Label>

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
						</div>

						<div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
							<Badge style={{
								display: 'flex', width: 'auto', height: '25px', padding: '5px',
								alignItems: 'center', justifyContent: 'center', backgroundColor: 'darkslategrey', border: 'none'
							}} href={'/userprofileedit/' + this.state.userProfile._id}>
								<i class="fa fa-pencil-square-o fa-lg" aria-hidden="true"> Edit</i>
							</Badge>
						</div>

					</Row>
				</Col>
			</div>
		)
	}
}

export default UserProfile
