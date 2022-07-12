import React, { useEffect, useState } from 'react';

export const TaskEditSuggestionRow = ({taskEditSuggestion}) => {


  return (
    <tr>
      <td>{taskEditSuggestion.user}</td>
      <td>{taskEditSuggestion.oldTask.taskName}</td>
      {/* TODO: make above a link to open TaskDifferenceModal */}
    </tr>
  );
}