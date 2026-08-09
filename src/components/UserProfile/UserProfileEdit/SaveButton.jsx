import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'reactstrap';
import EditConfirmModal from '../UserProfileModal/EditConfirmModal';
import { boxStyle, boxStyleDark } from '~/styles';

/**
 * @returns A random message displayed to the user after saving changes to a user profile
 */
const getRandomMessage = () => {
  const messages = [
    'If you are one of those people who are secure in your belief that your updates were saved, you don’t need this. Otherwise, know that, despite the best efforts of hoards of computer gremlins, hackers, and any lingering bad computer karma you may have, your updates have been successfully saved! Way to go!',
    'Research has shown that a fun workplace is not only more enjoyable, but also more productive. So, enjoy a little chuckle knowing the HGN electronic minions have reviewed your updated information, approved it, and stamped it on their foreheads so they won’t forget… or so they think. Their lives are complete now, and it’s all because of this successful update and save! \n' +
      '✺◟( ͡° ͜ʖ ͡°)◞✺\n',
    'Walla! YOU are a Super Saver. You clicked the “save” button and it worked! Well done, Jedi masters salute you!',
    'Way to go Champion, your update has been saved! Before you close this window, take a moment to bask in your own awesomeness. Think you dont deserve it? Think again! Many people forget to save their changes, you, however, are not one of them. Well done!',
  ];
  return messages[Date.now() % messages.length];
};

const invalidCodemessage =
  'Nice save! It seems you do not have a valid team code. It would be a lot cooler if you did. You can add one in the teams tab.';
const validTeamCodeRegex = /^.{5,7}$/;
const stillSavingMessage = 'Saving, will take just a second...';

/**
 * @param {func} props.handleSubmit
 * @param {bool} props.disabled
 * @param {*} props.userProfile
 * @param {func} props.setSaved
 * @returns
 */
const SaveButton = props => {
  const { handleSubmit, disabled, userProfile, setSaved, darkMode } = props;
  const [modal, setModal] = useState(false);
  const [randomMessage, setRandomMessage] = useState(getRandomMessage());
  const [isLoading, setIsLoading] = useState(false);
  const [isErr, setIsErr] = useState(false);
  const scrollSnapshot = useRef([]);

  const captureScrollPosition = event => {
    const buttonAncestors = [];
    let ancestor = event?.currentTarget?.parentElement;

    while (ancestor) {
      buttonAncestors.push(ancestor);
      ancestor = ancestor.parentElement;
    }

    const scrollContainers = [
      document.scrollingElement,
      document.documentElement,
      document.body,
      document.getElementById('root'),
      ...document.querySelectorAll('.modal-body'),
      ...buttonAncestors,
    ].filter(Boolean);

    scrollSnapshot.current = [...new Set(scrollContainers)].map(element => ({
      element,
      left: element.scrollLeft,
      top: element.scrollTop,
    }));
  };

  const restoreScrollPosition = () => {
    const restore = () => {
      scrollSnapshot.current.forEach(({ element, left, top }) => {
        element.scrollLeft = left;
        element.scrollTop = top;
      });
    };

    restore();
    requestAnimationFrame(() => requestAnimationFrame(restore));
  };

  const handleSave = async event => {
    event.preventDefault();
    event.stopPropagation();
    captureScrollPosition(event);
    setModal(true);
    setIsLoading(true);

    try {
      const getReturnVal = await handleSubmit();
      if (getReturnVal) throw new Error(getReturnVal);

      setIsLoading(false);
      setIsErr(false);
      setSaved();
    } catch (err) {
      setIsErr(true);
      setIsLoading(false);
    } finally {
      restoreScrollPosition();
    }
  };

  const closeModal = () => {
    setModal(false);
    restoreScrollPosition();
  };

  const getMessage = type => {
    if (type === 'message') {
      if (!isErr) return isLoading ? stillSavingMessage : randomMessage;

      return 'Sorry an error occurred while trying to save. Please try again another time.';
    }

    if (!isErr) return isLoading ? 'Saving...' : 'Success!';

    return 'Error occurred';
  };

  useEffect(() => {
    if (modal) {
      setRandomMessage(
        validTeamCodeRegex.test(userProfile.teamCode) ? getRandomMessage() : invalidCodemessage,
      );
    }
  }, [modal, userProfile.teamCode]);

  return (
    <React.Fragment>
      <EditConfirmModal
        isOpen={modal}
        closeModal={closeModal}
        userProfile={userProfile}
        modalTitle={getMessage('title')}
        modalMessage={getMessage('message')}
        disabled={isLoading}
        darkMode={darkMode}
        preserveScroll={restoreScrollPosition}
      />
      <Button
        type="button"
        {...(darkMode ? { outline: false } : { outline: true })}
        color="primary"
        onMouseDown={captureScrollPosition}
        onClick={handleSave}
        disabled={disabled}
        className="mr-1"
        style={
          darkMode
            ? {
                ...boxStyleDark,
                backgroundColor: '#f8f9fa',
                color: '#000',
                border: '1px solid #adb5bd',
              }
            : boxStyle
        }
      >
        Save Changes
      </Button>
    </React.Fragment>
  );
};

export default SaveButton;
