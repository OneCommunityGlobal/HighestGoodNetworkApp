import { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import hasPermission from '../../utils/permissions';
import { useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import Spinner from 'react-bootstrap/Spinner';
import { Button } from 'reactstrap';
import { updateWeeklySummaries } from '../../actions/weeklySummaries';
import styles from './Timelog.module.css';

export const moveWeeklySummary = (
  weeklySummaries,
  sourceIndex,
  destinationIndex,
  uploadDate = new Date().toISOString(),
) => {
  if (
    !Array.isArray(weeklySummaries) ||
    sourceIndex === destinationIndex ||
    !weeklySummaries[sourceIndex]?.summary ||
    weeklySummaries[destinationIndex]?.summary
  ) {
    return null;
  }

  return weeklySummaries.map((item, index) => {
    if (index === sourceIndex) {
      const { uploadDate: _uploadDate, ...sourceWithoutUploadDate } = item;
      return { ...sourceWithoutUploadDate, summary: '' };
    }
    if (index === destinationIndex) {
      return {
        ...item,
        summary: weeklySummaries[sourceIndex].summary,
        uploadDate,
      };
    }
    return item;
  });
};

function WeeklySummaries({ userProfile }) {
  const darkMode = useSelector(state => state.theme.darkMode);

  // Initialize state variables for editing and original summaries

  const [editing, setEditing] = useState([false, false, false]);

  const [editedSummaries, setEditedSummaries] = useState([
    userProfile.weeklySummaries[0]?.summary || '',
    userProfile.weeklySummaries[1]?.summary || '',
    userProfile.weeklySummaries[2]?.summary || '',
  ]);

  const [LoadingHandleSave, setLoadingHandleSave] = useState(null);
  const [moveSourceIndex, setMoveSourceIndex] = useState(null);
  const [moveDestinationIndex, setMoveDestinationIndex] = useState('');
  const [isMoving, setIsMoving] = useState(false);

  const [wordCount, setWordCount] = useState(0);

  const dispatch = useDispatch();
  const canEdit = dispatch(hasPermission('putUserProfile'));

  useEffect(() => {
    setEditedSummaries([
      userProfile.weeklySummaries[0]?.summary || '',
      userProfile.weeklySummaries[1]?.summary || '',
      userProfile.weeklySummaries[2]?.summary || '',
    ]);
  }, [userProfile]);

  const currentUserID = userProfile._id;
  const { user } = useSelector(state => state.auth);
  const loggedInUserId = user.userid;

  if (!userProfile.weeklySummaries || userProfile.weeklySummaries.length < 3) {
    return <div>No weekly summaries available</div>;
  }

  const toggleEdit = index => {
    const newEditing = editing.map((value, i) => (i === index ? !value : false));
    setEditing(newEditing);
  };

  const handleSummaryChange = (event, index, editor) => {
    const wordCounter = editor.plugins.wordcount.getCount();
    setWordCount(wordCounter);
    const newEditedSummaries = [...editedSummaries];
    newEditedSummaries[index] = event.target.value;
    setEditedSummaries(newEditedSummaries);
  };

  const handleCancel = index => {
    // Revert to the original summary content and toggle off editing mode
    const newEditedSummaries = [...editedSummaries];
    newEditedSummaries[index] = userProfile.weeklySummaries[index]?.summary || '';
    setEditedSummaries(newEditedSummaries);

    // Toggle off editing mode
    toggleEdit(index);
  };

  const handleSave = async index => {
    // Save the edited summary content and toggle off editing mode
    const editedSummary = editedSummaries[index];

    if (editedSummary.trim() !== '' && wordCount >= 50) {
      setLoadingHandleSave(index);
      const updatedUserProfile = {
        ...userProfile,
        weeklySummaries: userProfile.weeklySummaries.map((item, i) =>
          i === index ? { ...item, summary: editedSummary } : item,
        ),
      };

      const status = await dispatch(updateWeeklySummaries(userProfile._id, updatedUserProfile));
      if (status === 200) {
        // Toggle off editing mode only after the update succeeds.
        toggleEdit(index);
      }
      setLoadingHandleSave(null);
    } else {
      // Invalid summary, show an error message or handle it as needed
      // eslint-disable-next-line no-alert
      alert('Please enter a valid summary with at least 50 words.');
    }
  };

  const handleMove = async () => {
    const destinationIndex = Number(moveDestinationIndex);
    const weeklySummaries = moveWeeklySummary(
      userProfile.weeklySummaries,
      moveSourceIndex,
      destinationIndex,
    );

    if (!weeklySummaries) return;

    const mediaFolderUrl = userProfile.adminLinks?.find(
      link => link.Name === 'Media Folder',
    )?.Link;

    setIsMoving(true);
    const status = await dispatch(
      updateWeeklySummaries(userProfile._id, {
        mediaUrl: mediaFolderUrl || userProfile.mediaUrl || '',
        weeklySummaries,
        weeklySummariesCount: userProfile.weeklySummariesCount || 0,
      }),
    );
    if (status === 200) {
      setMoveSourceIndex(null);
      setMoveDestinationIndex('');
    }
    setIsMoving(false);
  };

  const cancelMove = () => {
    setMoveSourceIndex(null);
    setMoveDestinationIndex('');
  };

  // Images are not allowed while editing weekly summaries
  const customImageUploadHandler = () =>
    new Promise((_, reject) => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ message: 'Pictures are not allowed here!', remove: true });
    });

  const TINY_MCE_INIT_OPTIONS = {
    license_key: 'gpl',
    menubar: false,
    plugins: 'advlist autolink autoresize lists link charmap table help wordcount',
    toolbar:
      'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
    branding: false,
    min_height: 180,
    max_height: 500,
    autoresize_bottom_margin: 1,
    images_upload_handler: customImageUploadHandler,
    skin: darkMode ? 'oxide-dark' : 'oxide',
    content_css: darkMode ? 'dark' : 'default',
  };

  const renderSummary = (title, summary, index) => {
    if (editing[index]) {
      return (
        <div>
          <h3>{title}</h3>
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            init={TINY_MCE_INIT_OPTIONS}
            value={editedSummaries[index]}
            onEditorChange={(content, editor) =>
              handleSummaryChange({ target: { value: content } }, index, editor)
            }
            onGetContent={(content, editor) => setWordCount(editor.plugins.wordcount.getCount())}
          />

          <div style={{ marginTop: '10px' }}>
            <Button
              color="success"
              size="sm"
              className={`${styles.actionButton} ${styles.saveButton} ${
                darkMode ? styles.actionButtonDark : ''
              }`}
              onClick={() => handleSave(index)}
              disabled={LoadingHandleSave === index}
            >
              {LoadingHandleSave === index ? <Spinner animation="border" size="sm" /> : 'Save'}
            </Button>

            <Button
              color="danger"
              size="sm"
              className={`${styles.actionButton} ${styles.cancelButton} ${
                darkMode ? styles.actionButtonDark : ''
              }`}
              onClick={() => handleCancel(index)}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    if (summary && (canEdit || currentUserID === loggedInUserId)) {
      // Display the summary with an "Edit" button
      return (
        <div className={darkMode ? 'bg-yinmn-blue summary-text-light' : ''}>
          <h3>{title}</h3>
          {parse(editedSummaries[index])}
          <Button
            color="primary"
            size="sm"
            className={`${styles.actionButton} ${styles.editButton} ${
              darkMode ? styles.actionButtonDark : ''
            }`}
            onClick={() => toggleEdit(index)}
          >
            Edit
          </Button>
          <Button
            color="secondary"
            size="sm"
            className={`${styles.actionButton} ${styles.moveButton} ${
              darkMode ? styles.actionButtonDark : ''
            }`}
            onClick={() => {
              setMoveSourceIndex(index);
              setMoveDestinationIndex('');
            }}
          >
            Move
          </Button>
          {moveSourceIndex === index && (
            <div
              className={`${styles.moveControls} ${
                darkMode ? styles.moveControlsDark : ''
              }`}
            >
              <label htmlFor={`move-summary-${index}`}>
                Move to
                <select
                  id={`move-summary-${index}`}
                  className={`${styles.moveSelect} ${
                    darkMode ? styles.moveSelectDark : ''
                  }`}
                  value={moveDestinationIndex}
                  onChange={event => setMoveDestinationIndex(event.target.value)}
                  disabled={isMoving}
                >
                  <option value="">Select a week</option>
                  {[
                    "This week's summary",
                    "Last week's summary",
                    "The week before last's summary",
                  ].map((weekTitle, destinationIndex) => (
                    <option
                      key={weekTitle}
                      value={destinationIndex}
                      disabled={
                        destinationIndex === index ||
                        Boolean(userProfile.weeklySummaries[destinationIndex]?.summary)
                      }
                    >
                      {weekTitle}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                color="success"
                size="sm"
                className={`${styles.actionButton} ${styles.saveButton} ${
                  darkMode ? styles.actionButtonDark : ''
                }`}
                onClick={handleMove}
                disabled={moveDestinationIndex === '' || isMoving}
              >
                {isMoving ? <Spinner animation="border" size="sm" /> : 'Confirm Move'}
              </Button>
              <Button
                color="danger"
                size="sm"
                className={`${styles.actionButton} ${styles.cancelButton} ${
                  darkMode ? styles.actionButtonDark : ''
                }`}
                onClick={cancelMove}
                disabled={isMoving}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      );
    }
    if (summary) {
      // Display the summary without edit button for users without edit permissions
      return (
        <div className={darkMode ? 'bg-yinmn-blue summary-text-light' : ''}>
          <h3>{title}</h3>
          {parse(editedSummaries[index])}
        </div>
      );
    }
    // Display a message and allow authorized users to add a missing summary.
    return (
      <div>
        <h3>{title}</h3>
        <p className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
          {userProfile.firstName} {userProfile.lastName} did not submit a summary.
        </p>
        {(canEdit || currentUserID === loggedInUserId) && (
          <Button
            color="primary"
            size="sm"
            className={`${styles.actionButton} ${styles.editButton} ${
              darkMode ? styles.actionButtonDark : ''
            }`}
            onClick={() => toggleEdit(index)}
          >
            Edit
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={`${styles['responsive-font-size']} p-2 ${darkMode ? 'bg-yinmn-blue text-light' : ''}`}>
      {renderSummary("This week's summary", userProfile.weeklySummaries[0]?.summary, 0)}
      {renderSummary("Last week's summary", userProfile.weeklySummaries[1]?.summary, 1)}
      {renderSummary("The week before last's summary", userProfile.weeklySummaries[2]?.summary, 2)}
    </div>
  );
}

// const mapStateToProps = state => state;
// export default connect(mapStateToProps, { hasPermission })(WeeklySummaries);
export default WeeklySummaries;
