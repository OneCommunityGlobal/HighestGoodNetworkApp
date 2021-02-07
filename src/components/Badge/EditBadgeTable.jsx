import React from 'react';
import {
  Container, Button
} from 'reactstrap';


const EditBadgeTable = (props) =>
(<Container fluid>
  <table className="table table-bordered">
    <thead>
      <tr>
        <th>Badge</th>
        <th>Name</th>
        <th>Description</th>
        <th>Catergory</th>
        <th>Project</th>
        <th>Ranking</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {props.allBadgeData.map((value) =>
        <tr key={value._id} >
          <td className="badge_image_sm"> <img src={value.imageUrl} /></td>
          <td>{value.badgeName}</td>
          <td>{value.description}</td>
          <td>{value.category}</td>
          <td>{value.project.projectName}</td >
          <td>{value.ranking}</td>
          <td>
            <span className="badgemanagement-actions-cell">
              <Button outline color="info">Edit</Button>{' '}
            </span>
            <span className="badgemanagement-actions-cell">
              <Button outline color="danger">Delete</Button>
            </span>
          </td>
        </tr>)}
    </tbody>
  </table>
</Container >
);

export default EditBadgeTable;