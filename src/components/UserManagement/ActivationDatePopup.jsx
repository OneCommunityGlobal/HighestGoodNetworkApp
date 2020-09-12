import React, { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Input } from 'reactstrap'

/**
 * Modal popup to show the user profile in create mode
 */
const ActivationDatePopup = React.memo(props => {
  const [activationDate, onDateChange] = useState(Date.now())
  const closePopup = e => {
    props.onClose()
  }
  const pauseUser = () => {
    if (Date.parse(activationDate) > Date.now()) {
      props.onPause(activationDate)
    } else {
      alert('Please choose a future date')
    }
  }

  return (
    <Modal isOpen={props.open} toggle={closePopup}>
      <ModalHeader toggle={closePopup}>Pause until</ModalHeader>
      <ModalBody>
        <Input
          type="date"
          name="pauseUntilDate"
          id="pauseUntilDate"
          value={activationDate}
          onChange={event => {
            onDateChange(event.target.value)
          }}
          data-testid="date-input"
        />
      </ModalBody>
      <ModalFooter>
        <Button color="primary" onClick={pauseUser}>
          Pause the user
        </Button>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
})

export default ActivationDatePopup
