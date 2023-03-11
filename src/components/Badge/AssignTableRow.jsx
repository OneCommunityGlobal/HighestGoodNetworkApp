import React, { useState } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

const AssignTableRow = props => {
  const [isOpen, setOpen] = useState(false);

  const toggle = () => setOpen(isOpen => !isOpen);

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      props.addSelectBadge(e.target.id);
    } else {
      props.removeSelectBadge(e.target.id);
    }
  };

  return (
    <tr>
      <td className="badge_image_mini">
        {' '}
        <img src={props.badge.imageUrl} id={'popover_' + props.index.toString()} />
        <Popover
          trigger="hover"
          isOpen={isOpen}
          toggle={toggle}
          target={'popover_' + props.index.toString()}
        >
          <Card className="text-center">
            <CardImg className="badge_image_lg" src={props.badge.imageUrl} />
            <CardBody>
              <CardText>{props.badge.description}</CardText>
            </CardBody>
          </Card>
        </Popover>
      </td>
      <td>{props.badge.badgeName}</td>
      <td>
        <CustomInput type="checkbox" onChange={handleCheckBoxChange} id={props.badge._id}/>
      </td>
    </tr>
  );
};

const mapDispatchToProps = dispatch => ({
  addSelectBadge: badgeId => dispatch(addSelectBadge(badgeId)),
  removeSelectBadge: badgeId => dispatch(removeSelectBadge(badgeId)),
});

export default connect(null, mapDispatchToProps)(AssignTableRow);
