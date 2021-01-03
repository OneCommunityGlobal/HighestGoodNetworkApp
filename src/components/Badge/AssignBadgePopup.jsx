import React from 'react';
import {
  Table, Button, Input
} from 'reactstrap';


const AssignBadgePopup = (props) =>
(
  <div>
    <Table>
      <thead>
        <tr>
          <th>Badge</th>
          <th>Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.allBadgeData.map((value) =>
          <tr key={value._id}>
            <td className="badge_image_sm"> <img src={value.imageUrl} /></td>
            <td>{value.badgeName}</td>
            <td><Input type="checkbox" /></td>
          </tr>)}
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Confirm</Button>
  </div >
);

export default AssignBadgePopup;
