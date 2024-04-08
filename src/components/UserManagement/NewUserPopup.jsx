import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import AddNewUserProfile from '../UserProfile/AddNewUserProfile';
import { useHistory } from 'react-router-dom';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { connect } from 'react-redux';

/**
 * Modal popup to show the user profile in create mode
 */
const NewUserPopup = React.memo(props => {
  const closePopup = e => {
    props.onUserPopupClose();
  };
  const history = useHistory();

  const { role } = props; // Access the 'role' prop


  /**
   * User creation success call back.
   */
  const userCreated = () => {
    props.userCreated();
  };

  return (
    <>
      <div className="text-center" style={{ paddingTop: '1rem' }}>
        <EditableInfoModal
          areaName="UserManagment"
          areaTitle="User Management"
          fontSize={24}
          isPermissionPage={true}
          role={role} // Pass the 'role' prop to EditableInfoModal
        />
      </div>
      <Modal isOpen={props.open} toggle={closePopup} className={'modal-dialog modal-lg'}>
        <ModalHeader
          toggle={closePopup}
          cssModule={{ 'modal-title': 'w-100 text-center my-auto pl-2' }}
        >
          Create New User&nbsp;
          <EditableInfoModal
            areaName="NewUserPopup"
            areaTitle="New User"
            fontSize={24}
            isPermissionPage={true}
            role={role} // Pass the 'role' prop to EditableInfoModal
          />
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
              <Button color="primary" onClick={function noRefCheck() { }}>
                Confirm
              </Button>{' '}
              <Button onClick={function noRefCheck() { }}>Cancel</Button>
            </ModalFooter>
          </Modal>

          {/* Nested Modal that triggers when a first and last name user already exists */}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closePopup} style={boxStyle}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </>

  );
});

const mapStateToProps = state => ({
  role: state.userProfile.role, // Map 'role' from Redux state to 'role' prop
});

export default connect(mapStateToProps)(NewUserPopup);
