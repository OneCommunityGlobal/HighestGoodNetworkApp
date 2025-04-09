import { useState, useEffect } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect, useDispatch } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow(props) {
  const [isOpen, setOpen] = useState(false);
  const [isSelect, setSelect] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (existBadges?.includes(`assign-badge-${badge._id}`)) {
      setSelect(true);
      dispatch(addSelectBadge(`assign-badge-${badge._id}`));
    } else {
      setSelect(false);
    }
  }, []);

  const toggle = () => setOpen(prevIsOpen => !prevIsOpen);

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      props.addSelectBadge(e.target.id);
      setSelect(true);
    } else {
      props.removeSelectBadge(e.target.id);
      setSelect(false);
    }
  };

  return (
    <tr>
      <td className="badge_image_mini">
        <img src={badge.imageUrl} id={`popover_${index?.toString()}`} alt="" />
        <Popover
          trigger="hover"
          isOpen={isOpen}
          toggle={toggle}
          target={`popover_${index?.toString()}`}
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
        <CustomInput
          type="checkbox"
          id={`assign-badge-${badge._id}`}
          onChange={handleCheckBoxChange}
          checked={isSelect}
        />
      </td>
    </tr>
  );
}

export default AssignTableRow;
