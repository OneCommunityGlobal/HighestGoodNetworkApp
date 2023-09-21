// import React from 'react';
// import parse from 'html-react-parser';

// const WeeklySummaries = ({ userProfile, onEditClick }) => {
//   if (!userProfile.weeklySummaries || userProfile.weeklySummaries.length < 3) {
//     return <div>No weekly summaries available</div>;
//   }

//   const renderSummary = (title, summary, index) => {
//     if (summary) {
//       return (
//         <div>
//           <h3>{title}</h3>
//           {parse(summary)}
//           <button onClick={() =>onEditClick(index)}>Edit</button>
//         </div>
//       );
//     } else {
//       return (
//         <div>
//           <h3>{title}</h3>
//           <p>
//             {userProfile.firstName} {userProfile.lastName} did not submit a summary.
//           </p>
//         </div>
//       );
//     }
//   };

//   return (
//     <div>
//       {renderSummary("This week's summary", userProfile.weeklySummaries[0]?.summary)}
//       {renderSummary("Last week's summary", userProfile.weeklySummaries[1]?.summary)}
//       {renderSummary("The week before last's summary", userProfile.weeklySummaries[2]?.summary)}
//     </div>
//   );
// };

// export default WeeklySummaries;


import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import ReactHtmlParser from 'react-html-parser';
import './Timelog.css'
import updateWeeklySummaries from 'actions/weeklySummaries';


const WeeklySummaries = ({ userProfile }) => {
  // Initialize state variables for editing and original summaries
  const [editing, setEditing] = useState([false, false, false]);
  const [editedSummaries, setEditedSummaries] = useState([
    userProfile.weeklySummaries[0]?.summary || '',
    userProfile.weeklySummaries[1]?.summary || '',
    userProfile.weeklySummaries[2]?.summary || '',
  ]);
  const [originalSummaries, setOriginalSummaries] = useState([...editedSummaries]);

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
    // // Save the edited summary content and toggle off editing mode
    // // Update the userProfile with the latest edited summary
    //   const updatedUserProfile = { ...userProfile };
    //   updatedUserProfile.weeklySummaries[index].summary = editedSummaries[index];

    //   // Update the state with the edited content
    //   // setUserProfile(updatedUserProfile);
    //   userProfile = updatedUserProfile;
    // // Toggle off editing mode
    // toggleEdit(index);
    const editedSummary = editedSummaries[index];

    // Check if the edited summary is not blank and contains at least 50 words
    const wordCount = editedSummary.split(/\s+/).filter(Boolean).length;
    if (editedSummary.trim() !== '' && wordCount >= 50) {
      // Valid summary, proceed to save it

      // Create a copy of userProfile
      const updatedUserProfile = { ...userProfile };

      // Update the summary in the copy
      updatedUserProfile.weeklySummaries[index].summary = editedSummary;

      // Update the state with the edited content using updateUserProfile
      // setUserProfile(updatedUserProfile);
      userProfile = updatedUserProfile;
      // Save the edited summary to local storage
      // localStorage.setItem(`editedSummary_${index}`, editedSummary);

      // Toggle off editing mode
      toggleEdit(index);
    } else {
      // Invalid summary, show an error message or handle it as needed
      alert('Please enter a valid summary with at least 50 words.');
    }

  };

  const renderSummary = (title, summary, index) => {
    if (editing[index]) {
      const stripHtmlTags = (html) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
      };
      // Render an edit form when editing is active
      return (
        <div>
          <h3>{title}</h3>
          <textarea
            className = "edit-textarea"
            value={stripHtmlTags(editedSummaries[index])}
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

export default WeeklySummaries;
