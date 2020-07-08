import React from 'react'
import BlueSquare from '../BlueSquares'

import Image from 'react-bootstrap/Image'

import {
	Input,
	FormGroup,
	Label,
	CardImg,
	InputGroupAddon,
	InputGroupText,
	Button,
	Container,
	Row,
	Badge
} from 'reactstrap'
import { orange } from '../../../constants/colors'

const SideBar = ({
	firstName,
	lastName,
	profilePic,
	email,
	phoneNumber,
	jobTitle,
	canEditFields,
	isUserAdmin,
	infringments,
	privacySettings,
	handleUserProfile,
	handleImageUpload,
	handleBlueSquare
}) => {
	const edit = event => {
		console.log(event.target.value, event.target.id)
		let payload = null
		if (event.target.id === 'firstName') {
			payload = { firstName: event.target.value }
		}
		if (event.target.id === 'lastName') {
			payload = { lastName: event.target.value }
		}
		if (event.target.id === 'email') {
			payload = { email: event.target.value }
		}
		if (event.target.id === 'jobTitle') {
			payload = { jobTitle: event.target.value }
		}
	}

	return (
		<>
			<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
				<>
					<Label
						for='newProfilePic'
						htmlFor={'newProfilePic'}
						style={{ color: 'red', cursor: 'pointer' }}>
						Change Profile Picture
					</Label>

					<Input
						type='file'
						name='newProfilePic'
						id={'newProfilePic'}
						style={{ visibility: 'hidden', width: 0, height: 0 }}
						onChange={handleImageUpload}
						accept={'image/png,image/jpeg, image/jpg'}
					/>
				</>

				<Image src={profilePic || '/defaultprofilepic.png'}
					alt='Profile Picture'
					roundedCircle
					style={{ width: '250px', height: '250px' }}
				/>

				<BlueSquare 
					isUserAdmin={isUserAdmin}
					blueSquares={infringments}
					handleBlueSquare={handleBlueSquare}
				/>
					

			</div>

			<FormGroup>
				<br />
				<Label for='firstName'>First Name:</Label>
				<Input
					type='text'
					name='firstName'
					id='firstName'
					value={firstName}
					style={{ color: orange }}
					onChange={handleUserProfile}
					placeholder='First Name Cannot be blank'
					readOnly={canEditFields ? null : true}
				/>
			</FormGroup>

			<FormGroup>
				<Label for='lastName'>Last Name:</Label>
				<Input
					type='text'
					name='lastName'
					id='lastName'
					value={lastName}
					style={{ color: orange }}
					onChange={handleUserProfile}
					placeholder='Last Name Cannot be blank'
					readOnly={canEditFields ? null : true}
				/>
			</FormGroup>

			<FormGroup>
				<Label for='jobTitle'>Job Title:</Label>
				<Input
					type='title'
					name='jobTitle'
					id='jobTitle'
					value={jobTitle}
					style={{ color: orange }}
					onChange={handleUserProfile}
					placeholder=''
					readOnly={canEditFields ? null : true}
				/>
			</FormGroup>

			<FormGroup>
				<Label for='email'>Email:</Label>
				<InputGroupAddon addonType='prepend'>
					<InputGroupText>
					{console.log('checkbox email:',privacySettings.email)}
						<Input
							addon
							type='checkbox'
							aria-label='Checkbox for following text input'
							// checked={privacySettings.email}
							defaultChecked={privacySettings.email}
							onChange={handleUserProfile}
							id='emailPubliclyAccessible'
						/>
					</InputGroupText>
					<Label style={{ textAlign: 'center', marginBottom: '0' }}>Publicly Accessible?</Label>
				</InputGroupAddon>
				<Input
					type='email'
					name='email'
					id='email'
					style={{ color: orange }}
					value={email}
					onChange={handleUserProfile}
					placeholder='Email Cannot be blank'
					readOnly={canEditFields ? null : true}
				/>
			</FormGroup>

			<FormGroup>
				<Label for='phoneNumber'>Phone Number:</Label>

				<InputGroupAddon addonType='prepend'>
					<InputGroupText>

						<Input
							addon
							type='checkbox'
							aria-label='Checkbox for following text input'
							checked={privacySettings.phoneNumber}
							onChange={handleUserProfile}
							id='phoneNumberPubliclyAccessible'
						/>

					</InputGroupText>
					<Label style={{ textAlign: 'center', marginBottom: '0' }}>Publicly Accessible?</Label>
				</InputGroupAddon>

				<Input
					type='number'
					name='phoneNumber'
					id='phoneNumber'
					style={{ color: orange }}
					value={phoneNumber}
					onChange={handleUserProfile}
					readOnly={canEditFields ? null : true}
				/>

			</FormGroup>

		</>
	)
}

export default SideBar
