import { useState, useEffect } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect, useDispatch } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow(props) {
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);
  const [isSelect, setSelect] = useState(false);

  useEffect(() => {
    if (props.selectedBadges && props.selectedBadges.includes(`assign-badge-${props.badge._id}`)) {
      setSelect(true);
    } else {
      setSelect(false);
    }
  }, [props.selectedBadges, props.badge._id]);

  const toggle = () => setOpen(prevIsOpen => !prevIsOpen);

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      dispatch(addSelectBadge(e.target.id));
      setSelect(true);
    } else {
      dispatch(removeSelectBadge(e.target.id));
      setSelect(false);
    }
  };

  return (
    <tr>
      <td className="badge_image_mini">
        {' '}
        <img src={props.badge.imageUrl} id={`popover_${props.index.toString()}`} alt="" />
        <Popover
          trigger="hover"
          isOpen={isOpen}
          toggle={toggle}
          target={`popover_${props.index.toString()}`}
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
        <CustomInput
          type="checkbox"
          id={`assign-badge-${props.badge._id}`}
          onChange={handleCheckBoxChange}
          checked={isSelect}
        />
      </td>
    </tr>
  );
}

const mapDispatchToProps = dispatch => ({
  addSelectBadge: badgeId => dispatch(addSelectBadge(badgeId)),
  removeSelectBadge: badgeId => dispatch(removeSelectBadge(badgeId)),
});

export default connect(null, mapDispatchToProps)(AssignTableRow);