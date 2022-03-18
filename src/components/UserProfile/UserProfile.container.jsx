import { connect } from 'react-redux';
import _ from 'lodash';
import { updateUserProfile, clearUserProfile } from 'actions/userProfile';

import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects';
import UserProfile from './UserProfile';

const mapStateToProps = (state) => ({
  auth: state.auth,
  userProfile: state.userProfile,
  user: _.get(state, 'user', {}),
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
});

export default connect(mapStateToProps, {
  clearUserProfile,
  updateUserProfile,
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
})(UserProfile);
