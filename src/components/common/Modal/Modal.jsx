import React, { useState } from 'react'
import {
	Button,
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	Input,
	Label,
	FormGroup,
	Container
} from 'reactstrap'
import { filter } from 'lodash'


const ModalExample = props => {
	const {
		isOpen,
		closeModal,
		confirmModal,
		updateBlueSquare,
		modalTitle,
		modalMessage,
		type,
		linkType,
		infringments,
		id,
	} = props

	const [modal, setModal] = useState(false)
	const [linkName, setLinkName] = useState('')
	const [linkURL, setLinkURL] = useState('')

	const [dateStamp, setDateStamp] = useState('')
	const [summary, setSummary] = useState('')

	const toggle = () => setModal(!modal)

	let blueSquare = ''

	if (type === 'modBlueSquare' || type === 'viewBlueSquare') {
		if (id.length > 0){
			console.log('id:',id)
			blueSquare = infringments.filter(blueSquare => blueSquare._id === id);
			console.log("blue square:",blueSquare[0])
			console.log('date:', blueSquare[0].date)
		}
	}

	const handleChange = event => {
		event.preventDefault()

		if (event.target.id === 'linkName') {
			setLinkName(event.target.value.trim())
		} else if (event.target.id === 'linkURL') {
			setLinkURL(event.target.value.trim())
		} else if (event.target.id === 'summary') {
			setSummary(event.target.value)
		} else if (event.target.id === 'date') {
			setDateStamp(event.target.value)
		}

	}

	const buttonDisabled = !(linkName && linkURL)

	if (type) {
		console.log('Type of Modal is ', type, linkName, linkURL, buttonDisabled)
	}

	return (
		<Modal isOpen={isOpen} toggle={closeModal}>
			<ModalHeader toggle={closeModal}>{modalTitle}</ModalHeader>

			<ModalBody>
				{type === 'input' && (
					<>
						<InputGroup>
							<InputGroupAddon addonType='prepend'>
								<InputGroupText style={{ width: '80px' }}>Name</InputGroupText>
							</InputGroupAddon>
							<Input
								id='linkName'
								placeholder='Name of the link'
								onChange={handleChange}
							/>
						</InputGroup>
						<br />

						<InputGroup>
							<InputGroupAddon addonType='prepend'>
								<InputGroupText style={{ width: '80px' }}>Link URL</InputGroupText>
							</InputGroupAddon>
							<Input id='linkURL' placeholder='URL of the link' onChange={handleChange} />
						</InputGroup>
					</>
				)}

				{type === 'addBlueSquare' && (
					<>
						<FormGroup>
							<Label for="date">Date</Label>
							<Input type="date" name="date" id="date" onChange={handleChange} />
						</FormGroup>

						<FormGroup>
							<Label for="report">Summary</Label>
							<Input type="textarea" id="summary" onChange={handleChange} />
						</FormGroup>
					</>
				)}

				{type === 'modBlueSquare' && (
					<>
						<Label>Current Date: {blueSquare[0].date}</Label>
						<FormGroup>
							<Label for="date">Date</Label>
							<Input type="date" id="date" onChange={handleChange} />
						</FormGroup>

						<Label>Current Summary:</Label>
						<Label>{blueSquare[0].description}</Label>
						<FormGroup>
							<Label for="report">Summary</Label>
							<Input type="textarea" id="summary" onChange={handleChange} />
						</FormGroup>
					</>
				)}

				{type === 'viewBlueSquare' && (
					<>
						<FormGroup>
							<Label for="date">Date: {blueSquare[0].date}</Label>
						</FormGroup>
						<FormGroup>
							<Label for="description">Summary:</Label>
							<Label>{blueSquare[0].description}</Label>
						</FormGroup>
					</>
				)}

				{type === 'message' && (
					modalMessage
				)}

			</ModalBody>



			<ModalFooter>
				{type === 'addBlueSquare' && (
					<Button
						color='danger'
						onClick={() => updateBlueSquare('', dateStamp, summary, 'add')}>
						Submit
					</Button>
				)}

				{type === 'modBlueSquare' && (
					<>
						<Button color='info' onClick={() => updateBlueSquare(id, dateStamp, summary, 'update')}>
							Update
						</Button>
						<Button color='danger' onClick={() => updateBlueSquare(id, dateStamp, summary, 'delete')}>
							Delete
						</Button>
					</>
				)}

				{type === 'image' ?
					(
						<>
							<Button color='primary' onClick={closeModal}> Close </Button>
							<Button color="info" onClick={() => { window.open('https://picresize.com/') }}> Resize </Button>
						</>
					) : (
						<Button color='primary' onClick={closeModal}>
							Close
						</Button>
					)}

				{type === 'input' && (
					<Button
						color='danger'
						onClick={() => confirmModal(linkName, linkURL, linkType)}
						disabled={buttonDisabled}>
						Add
					</Button>
				)}

			</ModalFooter>
		</Modal>
	)
}

export default ModalExample
