import React, { useState, useEffect } from 'react';
import { Table, Button, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import AssignTableRow from '../Badge/AssignTableRow';
import {
  assignBadgesByUserID,
  clearNameAndSelected,
  closeAlert,
} from '../../actions/badgeManagement';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

const AssignBadgePopup = props => {
  const [searchedName, setSearchedName] = useState('');
  const [badgeList, setBadgeList] = useState([]);

  const onSearch = text => {
    setSearchedName(text);
  };

  const assignBadges = async () => {
    try {
      await props.assignBadgesByUserID(props.userProfile._id, props.selectedBadges);
      const response = await axios.get(ENDPOINTS.USER_PROFILE(props.userProfile._id));
      props.setUserProfile({
        ...props.userProfile,
        badgeCollection: response.data.badgeCollection,
      });
    } catch (e) {
      //TODO: Proper error handling.
    }
    props.handleSubmit();
    props.close();
  };
  useEffect(() => {
    loadAllBadges();
  }, []);

  const loadAllBadges = async () => {
    try {
      const response = await axios.get(ENDPOINTS.BADGE());
      setBadgeList(response.data);
    } catch (error) {}
  };

  const filterBadges = allBadges => {
    let filteredList = allBadges.filter(badge => {
      if (badge.badgeName.toLowerCase().indexOf(searchedName.toLowerCase()) > -1) {
        return badge;
      }
    });
    return filteredList;
  };

  let filteredBadges = filterBadges(badgeList);

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
      <div style={{ overflowY: 'scroll', height: '75vh'}}>
        <Table>
          <thead>
            <tr>
              <th>Badge</th>
              <th>Name</th>
              <th style={{ zIndex: '10' }}>
                <i className="fa fa-info-circle" id="SelectInfo" />
                <UncontrolledTooltip
                  placement="right"
                  target="SelectInfo"
                  style={{ backgroundColor: '#666', color: '#fff' }}
                >
                  <p className="badge_info_icon_text">
                    Hmmm, little blank boxes... what could they mean? Yep, you guessed it, check those
                    boxes to select the badges you wish to assign a person. Click the "Confirm" button
                    at the bottom when you've selected all you wish to add.
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
              <AssignTableRow badge={value} index={index} key={index}/>
            ))}
          </tbody>
        </Table>
      </div>
      <Button
        className="btn--dark-sea-green float-right"
        style={{ margin: 5 }}
        onClick={assignBadges}
      >
        Confirm
      </Button>
    </div>
  );
};

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
});

const mapDispatchToProps = dispatch => {
  return {
    assignBadgesByUserID: (userId, selectedBadge) =>
      assignBadgesByUserID(userId, selectedBadge)(dispatch),
    clearNameAndSelected: () => dispatch(clearNameAndSelected()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadgePopup);
