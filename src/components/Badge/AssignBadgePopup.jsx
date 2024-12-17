import { useState, useEffect } from 'react';
import { Table, Button, UncontrolledTooltip } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import AssignTableRow from './AssignTableRow';
import './AssignBadgePopup.css';
import { clearSelected } from '../../actions/badgeManagement';

function AssignBadgePopup(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const selectedBadges = useSelector(state => state.badge.selectedBadges);
  const [searchedName, setSearchedName] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {}, [selectedBadges]);

  const onSearch = text => {
    setSearchedName(text);
  };

  const filterBadges = allBadges => {
    return allBadges.filter(badge =>
      badge.badgeName.toLowerCase().includes(searchedName.toLowerCase()),
    );
  };

  const handleSubmit = () => {
    console.log('Submitting selected badges ---- ', selectedBadges);
    console.log('props ---- ', props);
    props.submit();
    dispatch(clearSelected());
  };

  const filteredBadges = filterBadges(props.allBadgeData);
  const isAnyBadgeSelected = selectedBadges.length > 0;

  return (
    <div>
      <input
        type="text"
        className="form-control assign_badge_search_box mb-3"
        placeholder="Search Badge Name"
        onChange={e => onSearch(e.target.value)}
      />
      <div className={`overflow-auto mb-2 max-h-300 ${darkMode ? 'bg-dark text-light' : ''}`}>
        <Table className={darkMode ? 'table-dark' : ''}>
          <thead>
            <tr>
              <th>Badge</th>
              <th>Name</th>
              <th>
                <i className="fa fa-info-circle" id="SelectInfo" />
                <UncontrolledTooltip
                  placement="right"
                  target="SelectInfo"
                  className="bg-secondary text-light"
                >
                  <p className="badge_info_icon_text">
                    Check those boxes to select the badges you wish to assign a person. Click the
                    "Confirm" button at the bottom when you've selected all you wish to add.
                  </p>
                  <p className="badge_info_icon_text">
                    Want to assign multiple of the same badge to a person? Repeat the process!
                  </p>
                </UncontrolledTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {console.log('selectedBadges', selectedBadges)}
            {filteredBadges.map((value, index) => (
              <AssignTableRow
                badge={value}
                index={index}
                key={index}
                selectedBadges={selectedBadges}
              />
            ))}
          </tbody>
        </Table>
      </div>
      <Button
        className={`btn btn-success float-right ${
          darkMode ? 'bg-dark text-light' : 'bg-success text-white'
        }`}
        onClick={handleSubmit}
        disabled={!isAnyBadgeSelected}
      >
        Confirm
      </Button>
    </div>
  );
}

export default AssignBadgePopup;
