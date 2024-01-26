import React, { useEffect, useState } from 'react';
import { datetimeToDate } from 'components/TeamMemberTasks/components/TaskDifferenceModal';
import { Link } from 'react-router-dom';

export const TaskEditSuggestionRow = ({
  taskEditSuggestion,
  handleToggleTaskEditSuggestionModal,
}) => {
  const handleButtonClick = (event) => {
    event.stopPropagation(); // This stops the click event from bubbling up to the parent <tr>
    handleToggleTaskEditSuggestionModal(taskEditSuggestion);
  };

  return (
    <table>
      <tbody>
        <tr onClick={() => handleToggleTaskEditSuggestionModal(taskEditSuggestion)}>
          <td>{datetimeToDate(taskEditSuggestion.dateSuggested)}</td>
          <td>{taskEditSuggestion.user}</td>
          <td>{taskEditSuggestion.oldTask.taskName}</td>
          <td>
            <button
              onClick={handleButtonClick}
              style={{
                backgroundColor: '#007bff',
                borderRadius: '5px',
                padding: '5px 10px',
                color: 'white',
              }}
            >
              View Suggestion
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};
