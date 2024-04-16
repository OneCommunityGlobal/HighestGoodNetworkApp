import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import EditConfirmModal from '../UserProfileModal/EditConfirmModal';
import { boxStyle } from 'styles';

/**
 *
 * @returns A random message displayed to the user after saving changes to a user profile
 */
const getRandomMessage = () => {
  const messages = [
    'If you are one of those people who are secure in your belief that your updates were saved, you don’t need this. Otherwise, know that, despite the best efforts of hoards of computer gremlins, hackers, and any lingering bad computer karma you may have, your updates have been successfully saved! Way to go!',
    'Research has shown that a fun workplace is not only more enjoyable, but also more productive. So, enjoy a little chuckle knowing the HGN electronic minions have reviewed your updated information, approved it, and stamped it on their foreheads so they won’t forget… or so they think. Their lives are complete now, and it’s all because of this successful update and save! \n' +
      '✺◟( ͡° ͜ʖ ͡°)◞✺\n',
    'Walla! YOU are a Super Saver. You clicked the “save” button and it worked! Well done, Jedi masters salute you!',
    'Way to go Champion, your update has been saved! Before you close this window, take a moment to bask in your own awesomeness. Think you don’t deserve it? Think again! Many people forget to save their changes, you, however, are not one of them. Well done!',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const invalidCodemessage = 'Nice save! It seems you do not have a valid team code. It would be a lot cooler if you did. You can add one in the teams tab';
const validTeamCodeRegex = /^([a-zA-Z]-[a-zA-Z]{3}|[a-zA-Z]{5})$/;
const stillSavingMessage = 'Saving, will take just a second...';

/**
 *
 * @param {func} props.handleSubmit
 * @param {bool} props.disabled
 * @param {*} props.userProfile
 * @param {func} props.setSaved
 * @returns
 */
const SaveButton = props => {
  const { handleSubmit, disabled, userProfile, setSaved } = props;
  const [modal, setModal] = useState(false);
  const [randomMessage, setRandomMessage] = useState(getRandomMessage());
  const [isLoading,setIsLoading] = useState(false);
  const [isErr, setIsErr] = useState(false);

  const handleSave = async () => {
    setModal(true);
    setIsLoading(true);
    try {
      const getReturnVal = await handleSubmit();
      if (getReturnVal) throw new Error(getReturnVal); // shouldn't return anything if save was success but should return error if it fails

      setIsLoading(false);
      setIsErr(false);
      setSaved();
    } catch (err) {
      setIsErr(true);
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModal(false);
  };

  const getMessage = (type) => {
    if (type == 'message') {
      if (!isErr) {
        return isLoading ? stillSavingMessage : randomMessage;
      }
  
      return 'Sorry an error occured while trying to save. Please try again another time.';
    } else {
      if (!isErr){
        return isLoading ? 'Saving...' : 'Success!';
      }

      return 'Error occured';
    }
  };

  useEffect(() => {
    if (modal === true) {
      const regexTest = validTeamCodeRegex.test(userProfile.teamCode);
      if (!regexTest) {
        setRandomMessage(invalidCodemessage);
      }
      else {
        setRandomMessage(getRandomMessage());
      }
    }
  }, [modal]);

  return (
    <React.Fragment>
      <EditConfirmModal
        isOpen={modal}
        closeModal={closeModal}
        userProfile={userProfile}
        modalTitle={getMessage('title')}
        modalMessage={getMessage('message')}
        disabled={isLoading}
      />
      <Button
        outline
        color='primary'
        // to={`/userprofile/${this.state.userProfile._id}`}
        className='btn btn-outline-primary mr-1'
        onClick={handleSave}
        disabled={disabled}
        style={boxStyle}
      >
        Save Changes
      </Button>
    </React.Fragment>
  );
};

export default SaveButton;
