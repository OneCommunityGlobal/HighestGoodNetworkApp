import React, { useEffect, useState } from 'react';

export const TaskEditSuggestionRow = ({taskEditSuggestion}) => {


  return (
    <tr>
      <td>{taskEditSuggestion.user}</td>
      <td>{taskEditSuggestion.taskName}</td>
    </tr>
  );
}