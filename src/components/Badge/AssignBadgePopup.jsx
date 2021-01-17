import React from 'react';
import {
  Table, Button
} from 'reactstrap';
import AssignTableRow from './AssignTableRow';

const AssignBadgePopup = (props) => (
  <div>
    <Table>
      <thead>
        <tr>
          <th>Badge</th>
          <th>Name</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {props.allBadgeData.map((value, index) =>
          <AssignTableRow badge={value} index={index} key={index} />
        )}
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} onClick={props.toggle}>Confirm</Button>
  </div>
);

export default AssignBadgePopup;

