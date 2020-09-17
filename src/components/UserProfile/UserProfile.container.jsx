import { connect } from 'react-redux';
import _ from 'lodash';
import {
  getUserProfile,
  updateUserProfile,
  clearUserProfile,
} from '../../actions/userProfile';
import { getUserTeamMembers } from '../../actions/team';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { getUserProjects } from '../../actions/userProjects'



import UserProfile from './UserProfile';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  user: _.get(state, 'user', {}),
  timeEntries: state.timeEntries,
  userProjects: state.userProjects,
});

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getUserTeamMembers,
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects
})(UserProfile);


