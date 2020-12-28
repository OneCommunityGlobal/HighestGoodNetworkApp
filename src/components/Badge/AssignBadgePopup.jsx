import React from 'react';
import {
  Table, Button
} from 'reactstrap';


const AssignBadgePopup = (props) =>
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
        {props.allBadgeData.map((value) => <tr><td className="badge_image_sm"> <img src={value.imageUrl} /></td><td>{value.badgeName}</td><td>checkbox</td></tr>)}
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Confirm</Button>
  </div >
);

export default AssignBadgePopup;
