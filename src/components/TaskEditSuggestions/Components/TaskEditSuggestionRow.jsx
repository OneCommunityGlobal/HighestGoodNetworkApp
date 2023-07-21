import React, { useEffect, useState } from 'react';
import { datetimeToDate } from 'components/TeamMemberTasks/components/TaskDifferenceModal';
import { Link } from 'react-router-dom';

export const TaskEditSuggestionRow = ({
  taskEditSuggestion,
  handleToggleTaskEditSuggestionModal,
}) => {
  return (
    <tr onClick={() => handleToggleTaskEditSuggestionModal(taskEditSuggestion)}>
      <td>{datetimeToDate(taskEditSuggestion.dateSuggested)}</td>
      <td>{taskEditSuggestion.user}</td>
      <td>
        {
          <Link to={`/wbs/tasks/${taskEditSuggestion.oldTask._id}`}>
            {taskEditSuggestion.oldTask.taskName}
          </Link>
        }
      </td>
    </tr>
  );
};
