import { useState, useEffect, useMemo } from 'react';
import { Card, CardBody, CardImg, CardText, Popover, CustomInput } from 'reactstrap';
import { connect, useDispatch, useSelector } from 'react-redux';
import { addSelectBadge, removeSelectBadge } from '../../actions/badgeManagement';

function AssignTableRow(props) {
  // Pull selected badges from Redux if prop is not passed
  const selectedFromStore = useSelector(s => s.badge?.selectedBadges || []);
  const effectiveSelected = props?.selectedBadges ?? selectedFromStore;
  const [isOpen, setOpen] = useState(false);

  const dispatch = useDispatch();
  const selectedBadges = useSelector(state => state.badge.selectedBadges); // array of badge._id

  const toggle = () => setOpen(prev => !prev);

  const initialChecked = useMemo(() => {
    const id = `assign-badge-${props.badge?._id}`;
    return Array.isArray(effectiveSelected) && effectiveSelected.includes(id);
  }, [effectiveSelected, props.badge?._id]);

  const [isSelect, setSelect] = useState(initialChecked);

  useEffect(() => {
    const id = `assign-badge-${props.badge?._id}`;
    const next = Array.isArray(effectiveSelected) && effectiveSelected.includes(id);
    setSelect(prev => (prev !== next ? next : prev));
  }, [effectiveSelected, props.badge?._id]);

  const badgeId = props.badge?._id;
  const domId = `assign-badge-${badgeId}`;

  // Initialize selection from props (badges that user already has)
  useEffect(() => {
    if (props.propExistBadges?.includes(badgeId)) {
      dispatch(addSelectBadge(badgeId));
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSelected = selectedBadges.includes(badgeId);
  // eslint-disable-next-line no-console
  console.log(selectedBadges, 'sele', badgeId, props);

  const handleCheckBoxChange = e => {
    if (e.target.checked) {
      dispatch(addSelectBadge(badgeId));
      setSelect(true);
    } else {
      dispatch(removeSelectBadge(badgeId));
      setSelect(false);
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
          target={`popover_${props?.index?.toString()}`}
        >
          <Card className="text-center">
            <CardImg className="badge_image_lg" src={props?.badge.imageUrl} />
            <CardBody>
              <CardText>{props.badge.description}</CardText>
            </CardBody>
          </Card>
        </Popover>
      </td>
      <td>{props?.badge.badgeName}</td>
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

const mapDispatchToProps = dispatch => ({
  addSelectBadge: badgeId => dispatch(addSelectBadge(badgeId)),
  removeSelectBadge: badgeId => dispatch(removeSelectBadge(badgeId)),
});

export default connect(null, mapDispatchToProps)(AssignTableRow);
