import React, { useEffect, useState } from 'react';

export const TaskEditSuggestionRow = ({taskEditSuggestion, handleToggleTaskEditSuggestionModal}) => {


  return (
    <tr onClick={() => handleToggleTaskEditSuggestionModal(taskEditSuggestion)}>
      <td>{taskEditSuggestion.user}</td>
      <td>{taskEditSuggestion.oldTask.taskName}</td>
    </tr>
  );
}