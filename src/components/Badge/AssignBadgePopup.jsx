import React from 'react';
import {
  Table, Button
} from 'reactstrap';


const AssignBadgePopup = () =>
(
  <div>
    <Table>
      <thead>
        <tr>
          <th>Badge</th>
          <th>Name</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>200px image</td>
          <td>300 Hours Education</td>
          <td>checkbox</td>
        </tr>
        <tr>
          <td>200px image</td>
          <td>100 Hours Streak</td>
          <td>checkbox</td>
        </tr>
        <tr>
          <td>200px image</td>
          <td>10 Weeks in A Row</td>
          <td>checkbox</td>
        </tr>
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Confirm</Button>
  </div >
);

export default AssignBadgePopup;
