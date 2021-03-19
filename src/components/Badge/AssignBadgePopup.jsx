import React, { useState } from 'react';
import {
  Table, Button
} from 'reactstrap';
import AssignTableRow from './AssignTableRow';

const AssignBadgePopup = (props) => {
  const [searchedName, setSearchedName] = useState('');

  const onSearch = (text) => {
    setSearchedName(text);
  }

  const filterBadges = (allBadges) => {
    let filteredList = allBadges.filter((badge) => {
      if (badge.badgeName.toLowerCase().indexOf(searchedName.toLowerCase()) > -1) { return badge; }
    });
    return filteredList;
  }

  let filteredBadges = filterBadges(props.allBadgeData);

  return (
    <div>
      <input type="text" className="form-control assign_badge_search_box"
        placeholder="Search Badge Name" onChange={(e) => {
          onSearch(e.target.value);
        }}
      />
      <Table>
        <thead>
          <tr>
            <th>Badge</th>
            <th>Name</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredBadges.map((value, index) =>
            <AssignTableRow badge={value} index={index} key={index} />
          )}
        </tbody>
      </Table>
      <Button className="btn--dark-sea-green float-right" style={{ margin: 5 }} onClick={props.toggle}>Confirm</Button>
    </div>
  );

}

export default AssignBadgePopup;

