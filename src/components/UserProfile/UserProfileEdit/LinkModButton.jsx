import React, { useState } from 'react';
import EditLinkModal from '../UserProfileModal/EditLinkModal';
import './UserProfileEdit.scss';

function LinkModButton(props) {
  const { updateLink, userProfile, setChanged, handleSubmit, color } = props;
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  return (
    <>
      <EditLinkModal
        updateLink={updateLink}
        isOpen={modal}
        closeModal={toggleModal}
        userProfile={userProfile}
        handleSubmit={handleSubmit}
        setChanged={setChanged}
        role={props.role}
      />
      <span
        style={{
          textDecoration: 'underline',
          color: color || 'grey',
          fontSize: '11pt',
          fontWeight: 600,
        }}
        data-testid="edit-link"
        role="button"
        type="button"
        onClick={toggleModal}
        href="#"
      >
        Edit
      </span>
    </>
  );
}

LinkModButton.propTypes = {};

export default LinkModButton;
