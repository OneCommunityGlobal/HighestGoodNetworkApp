import React, { useState } from 'react';
import EditLinkModal from '../UserProfileModal/EditLinkModal';
import './UserProfileEdit.scss';

const LinkModButton = props => {
  const { updateLink, userProfile, setChanged, handleSubmit, color, className } = props;
  const [modal, setModal] = useState(false);
  const toggleModal = () => {
    setModal(!modal);
  };
  return (
    <React.Fragment>
      <EditLinkModal
        updateLink={updateLink}
        isOpen={modal}
        closeModal={toggleModal}
        userProfile={userProfile}
        handleSubmit={handleSubmit}
        setChanged={setChanged}
        role={props.role}
      />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
      <span
        className={className}
        style={{
          textDecoration: 'underline',
          color: className ? undefined : color || 'grey',
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
    </React.Fragment>
  );
};

LinkModButton.propTypes = {};

export default LinkModButton;
