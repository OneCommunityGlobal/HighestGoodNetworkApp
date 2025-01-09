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
      <span
        style={{
          textDecoration: 'underline',
          color: color || 'grey',
          fontSize: '11pt',
          fontWeight: 600,
        }}
        data-testid="edit-link"
        role="button"
        tabIndex="0" // Makes the element focusable
        onClick={toggleModal}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevents default space scroll behavior
            toggleModal();
          }
        }}
      >
        Edit
      </span>
    </>
  );
}

LinkModButton.propTypes = {};

export default LinkModButton;
