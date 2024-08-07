import { useState } from 'react';
import { Table, Button, UncontrolledTooltip } from 'reactstrap';
import { boxStyle, boxStyleDark } from 'styles';
import AssignTableRow from './AssignTableRow';
import { useSelector } from 'react-redux';

function AssignBadgePopup(props) {
  const darkMode = useSelector(state => state.theme.darkMode);
  const [searchedName, setSearchedName] = useState('');

  const onSearch = text => {
    setSearchedName(text);
  };

  const filterBadges = allBadges => {
    const filteredList = allBadges.filter(badge => {
      if (badge.badgeName.toLowerCase().indexOf(searchedName.toLowerCase()) > -1) {
        return badge;
      }
      return 0;
    });
    return filteredList;
  };

  const filteredBadges = filterBadges(props.allBadgeData);

  return (
    <div>
      <input
        type="text"
        className="form-control assign_badge_search_box"
        placeholder="Search Badge Name"
        onChange={e => {
          onSearch(e.target.value);
        }}
      />
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        <Table className={darkMode ? 'text-light' : ''}>
          <thead>
            <tr className={darkMode ? 'bg-space-cadet' : ''}>
              <th>Badge</th>
              <th>Name</th>
              <th>
                <i className="fa fa-info-circle" id="SelectInfo" />
                <UncontrolledTooltip
                  placement="right"
                  target="SelectInfo"
                  style={{ backgroundColor: '#666', color: '#fff' }}
                >
                  <p className="badge_info_icon_text">
                    Hmmm, little blank boxes... what could they mean? Yep, you guessed it, check those
                    boxes to select the badges you wish to assign a person. Click the
                    &quot;Confirm&quot; button at the bottom when you&apos;ve selected all you wish to
                    add.
                  </p>
                  <p className="badge_info_icon_text">
                    Want to assign multiple of the same badge to a person? Repeat the process!!
                  </p>
                </UncontrolledTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBadges.map((value, index) => (
              <AssignTableRow
                badge={value}
                index={index}
                key={index}
                selectedBadges={props.selectedBadges}
              />
            ))}
          </tbody>
        </Table>
      </div>
      <Button
        className="btn--dark-sea-green float-right"
        style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
        onClick={props.submit}
      >
        Confirm
      </Button>
    </div>
  );
}

export default AssignBadgePopup;
