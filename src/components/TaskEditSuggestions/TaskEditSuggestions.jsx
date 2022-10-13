import React, { useEffect, useState } from 'react';
import { Container, Table } from 'reactstrap';
import { TaskEditSuggestionRow } from './TaskEditSuggestionRow';

const taskEditSuggestions = [
  {
    id: 1,
    user: "EK Example",
    taskName: "Ask Jae for feedback"
  },
  {
    id: 2,
    user: "EK Example",
    taskName: "Implement feedback"
  },
  {
    id: 3,
    user: "Test User",
    taskName: "Submit a PR"
  },
];

export const TaskEditSuggestions = () => {

  return (
    <Container>
      <h1>Task Edit Suggestions</h1>
      <Table>
        <thead>
          <tr>
            <th>User</th>
            <th>Task</th>
          </tr>
        </thead>
        <tbody>
          {
            taskEditSuggestions.map((taskEditSuggestion) => 
            <TaskEditSuggestionRow
              key={taskEditSuggestion._id}
              taskEditSuggestion={taskEditSuggestion}
            />)
          }
        </tbody>
      </Table>
    </Container>
  );
}