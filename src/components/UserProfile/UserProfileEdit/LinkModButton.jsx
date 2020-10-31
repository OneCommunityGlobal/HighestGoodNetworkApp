import React, { useState } from 'react';
import PropTypes from 'prop-types';
import EditLinkModal from '../UserProfileModal/EditLinkModal';
// import styleEdit from './UserProfileEdit.module.scss';
import './UserProfileEdit.scss';

const LinkModButton = (props) => {
  const { updateLink, userProfile, isUserAdmin } = props;
  const [modal, setModal] = useState(false);
  const handleLinkModel = () => {};
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
        isUserAdmin={isUserAdmin}
      />
      <button
        type="button"
        className="modLinkButton"
        data-testid="edit-link"
        onClick={() => {
          toggleModal();
        }}
      >
        <i className="fa fa-wrench fa-lg" aria-hidden="true">
          {' '}
        </i>
      </button>
    </React.Fragment>
  );
};

LinkModButton.propTypes = {};

export default LinkModButton;
