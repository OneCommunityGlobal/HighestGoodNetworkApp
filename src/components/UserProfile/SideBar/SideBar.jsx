import React, { Component } from 'react'

import { Input, FormGroup, Label, CardImg } from 'reactstrap'
import { orange, silverGray } from '../../../constants/colors'

const SideBar = ({ profilePic, firstName, editUserProfile }) => {
	const edit = event => {
		console.log(event.target.value, event.target.id)
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
				<Label for='firstName'>Name:</Label>
				<Input
					type='firstName'
					name='firstName'
					id='firstName'
					value={firstName}
					style={{ color: orange }}
					onChange={edit}
				/>
			</FormGroup>
			<FormGroup>
				<Label for='exampleEmail'>Email:</Label>
				<Input
					type='email'
					name='email'
					id='exampleEmail'
					placeholder='with a placeholder'
				/>
			</FormGroup>
			<FormGroup>
				<Label for='exampleEmail'>Job Role:</Label>
				<Input
					type='email'
					name='email'
					id='exampleEmail'
					placeholder='with a placeholder'
				/>
			</FormGroup>
		</>
	)
}

export default SideBar
