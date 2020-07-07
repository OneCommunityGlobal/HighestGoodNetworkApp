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



const ModalExample = props => {
	const {
		isOpen,
		closeModal,
		confirmModal,
		confirmInfringment,
		setInactiveModal,
		modalTitle,
		modalMessage,
		type,
		linkType,
		infringments,
	} = props

	const [modal, setModal] = useState(false)
	const [linkName, setLinkName] = useState('')
	const [linkURL, setLinkURL] = useState('')

	const [dateStamp, setDateStamp] = useState('')
	const [report, setReport] = useState('')

	const toggle = () => setModal(!modal)

	const handleChange = event => {
		event.preventDefault()

		if (event.target.id === 'linkName') {
			setLinkName(event.target.value.trim())
		} else if (event.target.id === 'linkURL') {
			setLinkURL(event.target.value.trim())
		} else if (event.target.id === 'report') {
			setReport(event.target.value)
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
							<Input type="date" name="date" id="date" placeholder="date placeholder" onChange={handleChange} />
						</FormGroup>

						<FormGroup>
							<Label for="report">Summary</Label>
							<Input type="textarea" name="report" id="report" onChange={handleChange} />
						</FormGroup>
					</>
				)}

				{/* {type === 'editBlueSquare' && (
					<>
						<FormGroup>
							<Label for="date">Date</Label>
							<Input type="date" name="date" id="date" placeholder={fetchedDate} onChange={handleChange} />
						</FormGroup>

						<FormGroup>
							<Label for="report">Summary</Label>
							<Input type="textarea" name="report" id="report" placeholder={fetchedSummary} onChange={handleChange} />
						</FormGroup>
					</>
				)} */}

				{type === 'removeBlueSquare' && (
					<>
						{/* <FormGroup>
							<Label for="date">Date</Label>
							<Input type="date" name="date" id="date" placeholder="date placeholder" onChange={handleChange} />
						</FormGroup>

						<FormGroup>
							<Label for="report">Report</Label>
							<Input type="textarea" name="report" id="report" onChange={handleChange} />
						</FormGroup> */}

						{/* Pop off the last blue square... */}
					</>
				)}

				{modalMessage}

			</ModalBody>



			<ModalFooter>
				{type === 'addBlueSquare' && (
					<Button
						color='danger'
						onClick={() => confirmInfringment(dateStamp, report)}>
						Submit
					</Button>
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
