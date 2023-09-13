import { useState } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow(props) {
  const [isOpen, setOpen] = useState(false);
  const { badge, index } = props;

  const toggle = () => setOpen(!isOpen);

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
        <img src={badge.imageUrl} id={`popover_${index.toString()}`} alt="" />
        <Popover
          trigger="hover"
          isOpen={isOpen}
          toggle={toggle}
          target={`popover_${index.toString()}`}
        >
          <Card className="text-center">
            <CardImg className="badge_image_lg" src={badge.imageUrl} />
            <CardBody>
              <CardText>{badge.description}</CardText>
            </CardBody>
          </Card>
        </Popover>
      </td>
      <td>{badge.badgeName}</td>
      <td>
        <CustomInput type="checkbox" onChange={handleCheckBoxChange} id={badge._id} />
      </td>
    </tr>
  );
}

const mapDispatchToProps = dispatch => ({
  addSelectBadge: badgeId => dispatch(addSelectBadge(badgeId)),
  removeSelectBadge: badgeId => dispatch(removeSelectBadge(badgeId)),
});

export default connect(null, mapDispatchToProps)(AssignTableRow);
