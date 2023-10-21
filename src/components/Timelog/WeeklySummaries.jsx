import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import ReactHtmlParser from 'react-html-parser';
import './Timelog.css'
import updateWeeklySummaries from 'actions/weeklySummaries';
import { updateUserProfile } from 'actions/userProfile';
import hasPermission from 'utils/permissions';
import { connect, useDispatch, useSelector } from 'react-redux';

const WeeklySummaries = ({ userProfile }) => {
  // Initialize state variables for editing and original summaries
  const [editing, setEditing] = useState([false, false, false]);
  const [editedSummaries, setEditedSummaries] = useState([
    userProfile.weeklySummaries[0]?.summary || '',
    userProfile.weeklySummaries[1]?.summary || '',
    userProfile.weeklySummaries[2]?.summary || '',
  ]);
  const [originalSummaries, setOriginalSummaries] = useState([...editedSummaries]);

  // const hasPermission = useSelector(state => state.hasPermission); // Assuming you have the permissions in your Redux state
  // const canEditSummary = hasPermission('editWeeklySummaryOptions');
  // if(canEditSummary){
  //   console.log("Yes");
  // }
  // else{
  //   console.log("No");
  // }
  const dispatch = useDispatch();

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

  const handleSave = (index) => {
    // Save the edited summary content and toggle off editing mode
    
    const editedSummary = editedSummaries[index];
    // const editedSummary = editedSummary1.replace(/{{NEWLINE}}/g, "\n");
    // Check if the edited summary is not blank and contains at least 50 words
    const wordCount = editedSummary.split(/\s+/).filter(Boolean).length;
    if (editedSummary.trim() !== '' && wordCount >= 50) {
      const updatedUserProfile = {
        ...userProfile,
        weeklySummaries: userProfile.weeklySummaries.map((item, i) =>
          i === index ? { ...item, summary: editedSummary } : item
        )
      };
  
    dispatch(updateUserProfile(userProfile._id, updatedUserProfile));

      // Toggle off editing mode
      toggleEdit(index);
    } else {
      // Invalid summary, show an error message or handle it as needed
      alert('Please enter a valid summary with at least 50 words.');
    }

  };

  const renderSummary = (title, summary, index) => {
    if (editing[index]) {
      // const stripHtmlTags = (html) => {
      //   const tmp = document.createElement("div");
      //   tmp.innerHTML = html.replace(/\n/g, "<br>");
      //   return tmp.textContent || tmp.innerText || "";
      // };
      // const editedContentWithPlaceholder = editedSummaries[index].replace(/\n/g, "{{NEWLINE}}");
      // Render an edit form when editing is active
      return (
        <div>
          <h3>{title}</h3>
          <textarea
            className = "edit-textarea"
            value={editedSummaries[index]}
            // value={stripHtmlTags(editedContentWithPlaceholder)}
            // value={stripHtmlTags(editedSummaries[index])}
            onChange={(event) => handleSummaryChange(event, index)}
          />
          <button className = "button save-button" onClick={() => handleSave(index)}>Save</button>
          <button className = "button cancel-button" onClick={() => handleCancel(index)}>Cancel</button>
        </div>
      );
    } else if (summary) {
      // Display the summary with an "Edit" button
      return (
        <div>
          <h3>{title}</h3>
          {parse(editedSummaries[index])}
          <button className = "button edit-button" onClick={() => toggleEdit(index)}>Edit</button>
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

const mapStateToProps = state => state;
export default connect(mapStateToProps, { hasPermission })(WeeklySummaries);
// export default WeeklySummaries;
