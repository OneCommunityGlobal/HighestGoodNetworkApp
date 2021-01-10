import React from 'react';
import {
  Table, Button, CustomInput,
} from 'reactstrap';
import { connect } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

const AssignBadgePopup = (props) => {

  const handleCheckBoxChange = (e) => {
    if (e.target.checked) {
      props.addSelectBadge(e.target.id);
    } else {
      props.removeSelectBadge(e.target.id);
    }
  };


  return (
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
          {props.allBadgeData.map(value => (
            <tr key={value._id}>
              <td className="badge_image_sm">
                {' '}
                <img src={value.imageUrl} />
              </td>
              <td>{value.badgeName}</td>
              <td><CustomInput type="checkbox" onChange={handleCheckBoxChange} id={value._id} /></td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} onClick={props.toggle}>Confirm</Button>
    </div>
  );
};


const mapDispatchToProps = dispatch => ({
  addSelectBadge: (badgeId) => dispatch(addSelectBadge(badgeId)),
  removeSelectBadge: (badgeId) => dispatch(removeSelectBadge(badgeId)),
});

export default connect(null, mapDispatchToProps)(AssignBadgePopup);
