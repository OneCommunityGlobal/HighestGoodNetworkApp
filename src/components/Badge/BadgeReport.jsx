import React from 'react';
import {
  Table, Button, CustomInput
} from 'reactstrap';

const BadgeReport = (props) => (
  <div>
    <Table>
      <thead>
        <tr>
          <th>Badge</th>
          <th>Name</th>
          <th>Description</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody>
        {props.badges.map((value, index) =>
          <tr key={index}>
            <td className="badge_image_sm"> <img src={value.badge.imageUrl} /></td>
            <td>{value.badge.badgeName}</td>
            <td>{value.badge.description}</td>
            <td><CustomInput type="checkbox" id={value.badge._id} /></td>
          </tr>
        )}
      </tbody>
    </Table>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }}>Export to PDF</Button>
    <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} >Feature on Profile</Button>
  </div >
);

export default BadgeReport;