import { useState } from 'react';
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
      <button
        style={{
          textDecoration: 'underline',
          color: color || 'grey',
          fontSize: '11pt',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
        }}
        data-testid="edit-link"
        type="button"
        onClick={toggleModal}
      >
        Edit
      </button>
    </>
  );
}

LinkModButton.propTypes = {};

export default LinkModButton;
