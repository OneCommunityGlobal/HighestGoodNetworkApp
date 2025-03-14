import { useState, useEffect } from 'react';
import { Table, Button, UncontrolledTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import axios from 'axios';
import AssignTableRow from '../Badge/AssignTableRow';
import { assignBadgesByUserID, clearNameAndSelected, addSelectBadge } from '../../actions/badgeManagement';
import { ENDPOINTS } from '../../utils/URL';
import { boxStyle, boxStyleDark } from '../../styles';
import { toast } from 'react-toastify';
import { PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE } from 'utils/constants';

function AssignBadgePopup(props) {
  const {darkMode} = props;
  const [searchedName, setSearchedName] = useState('');
  const [badgeList, setBadgeList] = useState([]);
  // Added state to disable confirm button while updating.
  const [shouldConfirmButtonDisable, setConfirmButtonDisable] = useState(false);

  const onSearch = text => {
    setSearchedName(text);
  };

  // Update: Added toast message effect for success and error. Added restriction: Jae's badges only editable by Jae or Owner
  const assignBadges = async () => {
    if(props.isRecordBelongsToJaeAndUneditable){
      alert(PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE);
      return;
    }
    try {
      setConfirmButtonDisable(true);
      await props.assignBadgesByUserID(props.userProfile._id, props.selectedBadges);
      const response = await axios.get(ENDPOINTS.USER_PROFILE(props.userProfile._id));
      props.setUserProfile({
        ...props.userProfile,
        badgeCollection: response.data.badgeCollection,
      });
      toast.success('Badge update successfully');
    } catch (e) {
      //TODO: Proper error handling.
      toast.error('Badge update failed');
    }
    setConfirmButtonDisable(false);
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

  const addExistBadges = () => {
    if (props.userProfile?.badgeCollection) {
      const existBadges = props.userProfile.badgeCollection
      .filter(badge => badge.badge && badge.badge._id)
      .map(badge => `assign-badge-${badge.badge._id}`);
      return existBadges;
    }
    return [];
  };

  let existBadges = addExistBadges();



  return (
    <div data-testid="test-assignbadgepopup">
      <input
        data-testid="test-searchBadgeName"
        type="text"
        className="form-control assign_badge_search_box"
        placeholder="Search Badge Name"
        onChange={e => {
          onSearch(e.target.value);
        }}
      />
      <div style={{ overflowY: 'scroll', height: '75vh' }}>
        <Table data-testid="test-badgeResults" className={darkMode ? 'text-light' : ''}>
          <thead>
            <tr>
              <th>Badge</th>
              <th>Name</th>
              <th style={{ zIndex: '10' }}>
                <i className="fa fa-info-circle" id="SelectInfo" data-testid="test-selectinfo" />
                <UncontrolledTooltip
                  placement="right"
                  target="SelectInfo"
                  style={{ backgroundColor: '#666', color: '#fff' }}
                  data-testid="test-tooltip"
                >
                  <p className="badge_info_icon_text" data-testid="test-tip1">
                    Hmmm, little blank boxes... what could they mean? Yep, you guessed it, check
                    those boxes to select the badges you wish to assign a person. Click the
                    &quot;Confirm&quot; button at the bottom when you&apos;ve selected all you wish
                    to add.
                  </p>
                  <p className="badge_info_icon_text" data-testid="test-tip2">
                    Want to assign multiple of the same badge to a person? Repeat the process!!
                  </p>
                </UncontrolledTooltip>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredBadges.map((value, index) => (
              <AssignTableRow badge={value} index={index} key={index} existBadges={existBadges} />
            ))}
          </tbody>
        </Table>
      </div>
      <Button
        className="btn--dark-sea-green float-right"
        style={darkMode ? {...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
        onClick={assignBadges}
        disabled={shouldConfirmButtonDisable}
        data-testid="test-button"
      >
        {!shouldConfirmButtonDisable ? 'Confirm' : 'Updating...'} 
      </Button>
    </div>
  );
}

const mapStateToProps = state => ({
  selectedBadges: state.badge.selectedBadges,
  darkMode: state.theme.darkMode,
});

const mapDispatchToProps = dispatch => {
  return {
    assignBadgesByUserID: (userId, selectedBadge) =>
      assignBadgesByUserID(userId, selectedBadge)(dispatch),
    clearNameAndSelected: () => dispatch(clearNameAndSelected()),
    addSelectBadge: badgeId => dispatch(addSelectBadge(badgeId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadgePopup);
