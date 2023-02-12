import { connect } from 'react-redux';
import _ from 'lodash';
import { updateUserProfile, clearUserProfile } from 'actions/userProfile';
import { updateTask } from 'actions/task';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { refreshToken } from '../../actions/authActions';
import { getUserProjects } from '../../actions/userProjects';
import UserProfile from './UserProfile';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  user: _.get(state, 'user', {}),
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  role: state.role,
  taskItems: state.tasks.taskItems,
});

export default connect(mapStateToProps, {
  clearUserProfile,
  updateUserProfile,
  getTimeEntriesForWeek,
  getTimeEntriesForPeriod,
  getUserProjects,
  updateTask,
  refreshToken,
})(UserProfile);
