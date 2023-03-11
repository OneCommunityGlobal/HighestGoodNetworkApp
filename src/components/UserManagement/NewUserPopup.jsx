import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AddNewUserProfile from '../UserProfile/AddNewUserProfile';
import { useHistory } from 'react-router-dom';

/**
 * Modal popup to show the user profile in create mode
 */
const NewUserPopup = React.memo(props => {
  const closePopup = e => {
    props.onUserPopupClose();
  };
  const history = useHistory();

  /**
   * User creation success call back.
   */
  const userCreated = () => {
    props.userCreated();
  };

  return (
    <Modal isOpen={props.open} toggle={closePopup} className={'modal-dialog modal-lg'}>
      <ModalHeader
        toggle={closePopup}
        cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
      >
        Create New User
      </ModalHeader>
      <ModalBody>
        <AddNewUserProfile
          closePopup={closePopup}
          isAddNewUser={true}
          history={history}
          userCreated={userCreated}
          userProfiles={props.userProfiles}
        />

        {/* Nested Modal that triggers when a first and last name user already exists */}

        <Modal isOpen={props.close}>
          <ModalHeader>WARNING: Duplicate Name Exists!</ModalHeader>
          <ModalBody>
            A user with a first and/or last name already exists. Do you still want to create this
            user?
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={function noRefCheck() {}}>
              Confirm
            </Button>{' '}
            <Button onClick={function noRefCheck() {}}>Cancel</Button>
          </ModalFooter>
        </Modal>

        {/* Nested Modal that triggers when a first and last name user already exists */}
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={closePopup}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
});

export default NewUserPopup;
