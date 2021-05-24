import React, { useState } from 'react';
import { Button } from 'reactstrap';
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

  const messages = {
    saved: [
      "Your update has been posted",
      "Another one!",
      "Saved by the bell",
      "One more for the history books",
      "Way to go Champion, your update has been saved! Before you close this window, take a moment to bask in your own awesomeness. Think you don’t deserve it? Think again! Many people forget to save their changes, you, however, are not one of them. Well done!"
    ]
  };

  const randomMsg = (msgs) => msgs[Math.floor(Math.random() * msgs.length)];

  return (
    <React.Fragment>
      <EditConfirmModal
        isOpen={modal}
        closeModal={toggleModal}
        userProfile={userProfile}
        modalTitle="Success!"
        modalMessage={randomMsg(messages.saved)}
      />
      <Button
        outline
        color="primary"
        // to={`/userprofile/${this.state.userProfile._id}`}
        className="btn btn-outline-primary"
        onClick={handleSave}
        disabled={disabled}
      >
        Save Changes
      </Button>
    </React.Fragment>
  );
}

export default SaveButton;
