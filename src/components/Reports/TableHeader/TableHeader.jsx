import React from 'react';

export const TableHeader = () =>
  (
    <tr className='table-header-wrapper'>
      <th>Task</th>
      <th>Priority</th>
      <th>Status</th>
      <th>Resources</th>
      <th>Active</th>
      <th>Assign</th>
      <th>Estimated Hours</th>
      <th>Start Date</th>
      <th>End Date</th>
    </tr>
  );
