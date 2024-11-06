import { useState, useEffect } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow({ badge, index, existBadges }) {
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
    const isChecked = e.target.checked;
    setSelect(isChecked);
    if (isChecked) {
      dispatch(addSelectBadge(`assign-badge-${badge._id}`));
    } else {
      dispatch(removeSelectBadge(`assign-badge-${badge._id}`));
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
