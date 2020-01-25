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
	Input
} from 'reactstrap'
const ModalExample = props => {
	const {
		isOpen,
		closeModal,
		confirmModal,
		modalTitle,
		modalMessage,
		type,
		linkType
	} = props

	const [modal, setModal] = useState(false)
	const [linkName, setLinkName] = useState('')
	const [linkURL, setLinkURL] = useState('')

	const toggle = () => setModal(!modal)

	const handleChange = event => {
		event.preventDefault()

		if (event.target.id === 'linkName') {
			setLinkName(event.target.value.trim())
		} else {
			setLinkURL(event.target.value.trim())
		}
	}

	const buttonDisabled = !(linkName && linkURL)

	console.log('Type of Modal is ', type, linkName, linkURL, buttonDisabled)

	return (
		<Modal isOpen={isOpen} toggle={closeModal}>
			<ModalHeader toggle={closeModal}>{modalTitle}</ModalHeader>

			<ModalBody>
				{type === 'input' ? (
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
				) : (
					modalMessage
				)}
			</ModalBody>
			<ModalFooter>
				<Button color='primary' onClick={closeModal}>
					Close
				</Button>

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
