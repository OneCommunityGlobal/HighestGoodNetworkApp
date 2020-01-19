import React, { Component } from 'react'

import { Input, FormGroup, Label, CardImg } from 'reactstrap'
import { orange, silverGray } from '../../../constants/colors'

const SideBar = ({
	firstName,
	lastName,
	profilePic,
	email,
	phoneNumber,
	jobTitle,
	handleUserProfile
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

		//editUserProfile(payload)
	}

	return (
		<>
			<CardImg
				top
				width='90%'
				src={profilePic || '/defaultprofilepic.png'}
				alt='Card image cap'
			/>
			<FormGroup>
				<Label for='firstName'>First Name:</Label>
				<Input
					type='text'
					name='firstName'
					id='firstName'
					value={firstName}
					style={{ color: orange }}
					onChange={handleUserProfile}
					placeholder='First Name Cannot be blank'
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
				/>
			</FormGroup>
			<FormGroup>
				<Label for='email'>Email:</Label>
				<Input
					type='email'
					name='email'
					id='email'
					style={{ color: orange }}
					value={email}
					onChange={handleUserProfile}
					placeholder='Email Cannot be blank'
				/>
			</FormGroup>
			<FormGroup>
				<Label for='phoneNumber'>Phone Number:</Label>
				<Input
					type='number'
					name='phoneNumber'
					id='phoneNumber'
					style={{ color: orange }}
					value={phoneNumber}
					onChange={handleUserProfile}
				/>
			</FormGroup>
			<FormGroup>
				<Label for='jobTitle'>Job Title:</Label>
				<Input
					type='text'
					name='jobTitle'
					id='jobTitle'
					style={{ color: orange }}
					value={jobTitle}
					onChange={handleUserProfile}
				/>
			</FormGroup>
		</>
	)
}

export default SideBar
