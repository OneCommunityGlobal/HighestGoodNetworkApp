import React, { Component, useState } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import EditConfirmModal from '../UserProfileModal/EditConfirmModal';

function SaveButton(props) {
  const { handleSubmit, disabled, userProfile } = props;
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  const handleSave = () => {
    handleSubmit();
    toggleModal();
  };
  return (
    <React.Fragment>
      <EditConfirmModal
        isOpen={modal}
        closeModal={toggleModal}
        userProfile={userProfile}
        modalTitle="Success!"
        modalMessage="Your update has been posted"
      />
      <Button
        outline
        color="primary"
        // to={`/userprofile/${this.state.userProfile._id}`}
        className="btn btn-outline-primary"
        onClick={handleSave}
        style={{ display: 'flex', margin: 5 }}
        disabled={disabled}
      >
        Save Changes
      </Button>
    </React.Fragment>
  );
}

export default SaveButton;
