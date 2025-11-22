import { useState, useEffect } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow({ badge, index, existBadges: propExistBadges }) {
  const dispatch = useDispatch();
  const selectedBadges = useSelector(state => state.badge.selectedBadges); // array of badge._id

  const [isOpen, setOpen] = useState(false);
  const toggle = () => setOpen(prev => !prev);

  const badgeId = badge._id;
  const domId = `assign-badge-${badgeId}`;

  // Initialize selection from props (badges that user already has)
  useEffect(() => {
    if (propExistBadges?.includes(badgeId)) {
      dispatch(addSelectBadge(badgeId));
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSelected = selectedBadges.includes(badgeId);

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      dispatch(addSelectBadge(badgeId));
    } else {
      dispatch(removeSelectBadge(badgeId));
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
          id={domId}
          onChange={handleCheckBoxChange}
          checked={isSelected}
        />
      </td>
    </tr>
  );
}

export default AssignTableRow;
