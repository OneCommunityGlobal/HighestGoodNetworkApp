import { useState, useEffect } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { useDispatch } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow(props) {
  const [isOpen, setOpen] = useState(false);
  const [isSelect, setSelect] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setSelect(props.selectedBadges.includes(`assign-badge-${props.badge._id}`));
  }, [props.selectedBadges, props.badge._id]);

  const toggle = () => setOpen(prevIsOpen => !prevIsOpen);

  const handleCheckBoxChange = e => {
    const isChecked = e.target.checked;
    setSelect(isChecked);
    if (isChecked) {
      dispatch(addSelectBadge(`assign-badge-${props.badge._id}`));
    } else {
      dispatch(removeSelectBadge(`assign-badge-${props.badge._id}`));
    }
  };

  return (
    <tr>
      <td className="badge_image_mini">
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

export default AssignTableRow;
