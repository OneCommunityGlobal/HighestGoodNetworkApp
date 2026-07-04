import axios from 'axios';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Button, Spinner, Table, UncontrolledTooltip } from 'reactstrap';
import { PROTECTED_ACCOUNT_MODIFICATION_WARNING_MESSAGE } from '~/utils/constants';
import { ENDPOINTS } from '~/utils/URL';
import {
  assignBadgesByUserID,
  clearNameAndSelected,
} from '../../actions/badgeManagement';
import { boxStyle, boxStyleDark } from '../../styles';
import AssignTableRow from '../Badge/AssignTableRow';


function AssignBadgePopup(props) {
  const { darkMode } = props;
  const [searchedName, setSearchedName] = useState('');
  const [badgeList, setBadgeList] = useState([]);
  // Added state to disable confirm button while updating.
  const [shouldConfirmButtonDisable, setConfirmButtonDisable] = useState(false);
  const [isLoadingBadge, setisLoadingBadge] = useState(true);

  const onSearch = text => {
    setSearchedName(text);
  };

  // Update: Added toast message effect for success and error. Added restriction: Jae's badges only editable by Jae or Owner
  const assignBadges = async () => {
    if (props.isRecordBelongsToJaeAndUneditable) {
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
      // 🔹 Clear selected badges in Redux after a successful save
      props.clearNameAndSelected();
    } catch (e) {
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
      setisLoadingBadge(false);
    } catch (error) {}
  };

 const formatSearchInput = text => {
    return text
      .toLowerCase()
      .replace(/\s+/g, '')
      .trim();
  };

  const filterBadges = (allBadges = []) => {
    // guard against non-array inputs
    if (!Array.isArray(allBadges)) return [];
    return allBadges.filter(({ badgeName }) =>
      formatSearchInput(badgeName).includes(formatSearchInput(searchedName)),
    );
  };

  const filteredBadges = useMemo(() => {
    return filterBadges(badgeList);
  }, [badgeList, searchedName]);

  const addExistBadges = () => {
  if (props.userProfile?.badgeCollection) {
    const existBadges = props.userProfile.badgeCollection
      .filter(b => b && b.badge && typeof b.badge === 'object' && b.badge._id)
      .map(b => b.badge._id);
    return existBadges;
  }
  return [];
};
  let existBadges = addExistBadges();

  return (
    <div data-testid="test-assignbadgepopup">
      {/* Comprehensive dark mode hover style fix */}
      {darkMode && (
        <style>{`
          .dark-mode-table tbody tr:hover,
          .dark-mode-table tbody tr:hover td,
          .dark-mode-table thead tr:hover,
          .dark-mode-table thead tr:hover th,
          .dark-mode-table thead tr:hover i {
            background-color: #2b3553 !important;
            color: #ffffff !important;
          }
        `}</style>
      )}
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
        {!isLoadingBadge && (props.isTableOpen !== undefined ? props.isTableOpen : filteredBadges.length > 0) ? (
          <Table 
            data-testid="test-badgeResults" 
            className={darkMode ? 'text-light dark-mode-table' : ''}
          >
            <thead
              style={
                darkMode
                  ? { backgroundColor: '#1c2541', color: '#fff' }
                  : { backgroundColor: '#f0f8ff', color: 'black' }
              }
            >
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
                      &quot;Confirm&quot; button at the bottom when you&apos;ve selected all you
                      wish to add.
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
                <AssignTableRow badge={value} index={index} key={value._id || index} propExistBadges={existBadges} />
              ))}
            </tbody>
          </Table>
        ) : isLoadingBadge && filteredBadges.length === 0 ? (
          <div
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            <h3 className={`text-center ${darkMode ? 'text-light' : 'text-dark'}`}>
              Loading Badges...
            </h3>

            <Spinner color="primary" />
          </div>
        ) : (
          !isLoadingBadge &&
          filteredBadges.length === 0 && (
            <h3 className={`text-center ${darkMode ? 'text-light' : 'text-dark'}`}>
              No badges found
            </h3>
          )
        )}
      </div>
      <Button
        className="btn--dark-sea-green float-right"
        style={darkMode ? { ...boxStyleDark, margin: 5 } : { ...boxStyle, margin: 5 }}
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
  };
};

AssignBadgePopup.propTypes = {
  userProfile: PropTypes.shape({
    _id: PropTypes.string,
    badgeCollection: PropTypes.array,
  }),
  selectedBadges: PropTypes.array,
  darkMode: PropTypes.bool,
  isRecordBelongsToJaeAndUneditable: PropTypes.bool,
  isTableOpen: PropTypes.bool,
  setUserProfile: PropTypes.func,
  handleSubmit: PropTypes.func,
  close: PropTypes.func,
  assignBadgesByUserID: PropTypes.func,
  clearNameAndSelected: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(AssignBadgePopup);
