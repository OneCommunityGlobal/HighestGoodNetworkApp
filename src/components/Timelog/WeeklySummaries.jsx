import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import './Timelog.css'
import updateWeeklySummaries from 'actions/weeklySummaries';
import { getUserProfile, updateUserProfile } from 'actions/userProfile';
import hasPermission from 'utils/permissions';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Editor } from '@tinymce/tinymce-react';
import { userProfileByIdReducer } from 'reducers/userProfileByIdReducer';

const WeeklySummaries = ({ userProfile }) => {
  // Initialize state variables for editing and original summaries
  const [editing, setEditing] = useState([false, false, false]);
  const [editedSummaries, setEditedSummaries] = useState([
    userProfile.weeklySummaries[0]?.summary || '',
    userProfile.weeklySummaries[1]?.summary || '',
    userProfile.weeklySummaries[2]?.summary || '',
  ]);
  const [originalSummaries, setOriginalSummaries] = useState([...editedSummaries]);

  const dispatch = useDispatch();
  const canEdit = dispatch(hasPermission('putUserProfile'));

  const currentUserID = userProfile._id;
  const { user } = useSelector(state => state.auth);
  const loggedInUserId = user.userid;

  if (!userProfile.weeklySummaries || userProfile.weeklySummaries.length < 3) {
    return <div>No weekly summaries available</div>;
  }

  const toggleEdit = (index) => {
    // Toggle the editing state for the specified summary
    const newEditing = [...editing];
    newEditing[index] = !newEditing[index];
    setEditing(newEditing);
  };

  const handleSummaryChange = (event, index) => {
    // Update the edited summary content
    const newEditedSummaries = [...editedSummaries];
    newEditedSummaries[index] = event.target.value;
    setEditedSummaries(newEditedSummaries);
  };

  const handleCancel = (index) => {
    // Revert to the original summary content and toggle off editing mode
    const newEditedSummaries = [...editedSummaries];
    newEditedSummaries[index] = userProfile.weeklySummaries[index]?.summary || '';
    setEditedSummaries(newEditedSummaries);
    
    // Toggle off editing mode
    toggleEdit(index);
  };

  const handleSave = async (index) => {
    // Save the edited summary content and toggle off editing mode
    const editedSummary = editedSummaries[index];
    // Check if the edited summary is not blank and contains at least 50 words
    const wordCount = editedSummary.split(/\s+/).filter(Boolean).length;
    if (editedSummary.trim() !== '' && wordCount >= 50) {
      const updatedUserProfile = {
        ...userProfile,
        weeklySummaries: userProfile.weeklySummaries.map((item, i) =>
          i === index ? { ...item, summary: editedSummary } : item
        )
      };
  
    await dispatch(updateUserProfile(userProfile._id, updatedUserProfile));
    await dispatch(getUserProfile(userProfile._id));
      // Toggle off editing mode
      toggleEdit(index);
    } else {
      // Invalid summary, show an error message or handle it as needed
      alert('Please enter a valid summary with at least 50 words.');
    }

  };

  const renderSummary = (title, summary, index) => {
    if (editing[index]) {
      return (
        <div>
          <h3>{title}</h3>
          <Editor
            init={{
              menubar: false,
              plugins: 'advlist autolink autoresize lists link charmap table paste help wordcount',
              toolbar:
                'bold italic underline link removeformat | bullist numlist outdent indent | styleselect fontsizeselect | table| strikethrough forecolor backcolor | subscript superscript charmap | help',
              branding: false,
              min_height: 180,
              max_height: 500,
              autoresize_bottom_margin: 1,
            }}
            value={editedSummaries[index]}
            onEditorChange={(content) => handleSummaryChange({ target: { value: content } }, index)}
          />
          <button className = "button save-button" onClick={() => handleSave(index)}>Save</button>
          <button className = "button cancel-button" onClick={() => handleCancel(index)}>Cancel</button>
        </div>
      );
    } else if (summary && (canEdit || currentUserID == loggedInUserId)) {
      // Display the summary with an "Edit" button
      return (
        <div>
          <h3>{title}</h3>
          {parse(editedSummaries[index])}
          <button className = "button edit-button" onClick={() => toggleEdit(index)}>Edit</button>
        </div>
      );
    } else if (summary){
      // Display the summary with an "Edit" button
      return (
        <div>
          <h3>{title}</h3>
          {parse(editedSummaries[index])}
        </div>
      );
    } else {
      // Display a message when there's no summary
      return (
        <div>
          <h3>{title}</h3>
          <p>
            {userProfile.firstName} {userProfile.lastName} did not submit a summary.
          </p>
        </div>
      );
    }
  };

  return (
    <div>
      {renderSummary("This week's summary", userProfile.weeklySummaries[0]?.summary, 0)}
      {renderSummary("Last week's summary", userProfile.weeklySummaries[1]?.summary, 1)}
      {renderSummary("The week before last's summary",userProfile.weeklySummaries[2]?.summary,2)}
    </div>
  );
};

// const mapStateToProps = state => state;
// export default connect(mapStateToProps, { hasPermission })(WeeklySummaries);
export default WeeklySummaries;
