import React, { useEffect, useState } from 'react';
import { datetimeToDate } from 'components/TeamMemberTasks/components/TaskDifferenceModal';

export const TaskEditSuggestionRow = ({taskEditSuggestion, handleToggleTaskEditSuggestionModal}) => {


  return (
    <tr onClick={() => handleToggleTaskEditSuggestionModal(taskEditSuggestion)}>
      <td>{datetimeToDate(taskEditSuggestion.dateSuggested)}</td>
      <td>{taskEditSuggestion.user}</td>
      <td>{taskEditSuggestion.oldTask.taskName}</td>
    </tr>
  );
}