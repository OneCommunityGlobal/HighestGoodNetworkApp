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
      "If you are one of those people who are secure in your belief that your updates were saved, you don’t need this. Otherwise, know that, despite the best efforts of hoards of computer gremlins, hackers, and any lingering bad computer karma you may have, your updates have been successfully saved! Way to go!",
      "Research has shown that a fun workplace is not only more enjoyable, but also more productive. So, enjoy a little chuckle knowing the HGN electronic minions have reviewed your updated information, approved it, and stamped it on their foreheads so they won’t forget… or so they think. Their lives are complete now, and it’s all because of this successful update and save! \n" +
      "✺◟( ͡° ͜ʖ ͡°)◞✺\n",
      "Walla! YOU are a Super Saver. You clicked the “save” button and it worked! Well done, Jedi masters salute you!",
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
