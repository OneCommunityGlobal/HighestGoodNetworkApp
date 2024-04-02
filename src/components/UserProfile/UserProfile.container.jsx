import { connect } from 'react-redux';
import { get } from 'lodash';
import { updateUserProfile, clearUserProfile } from 'actions/userProfile';
import { updateTask } from 'actions/task';
import { getTimeEntriesForWeek, getTimeEntriesForPeriod } from '../../actions/timeEntries';
import { refreshToken } from '../../actions/authActions';
import { getUserProjects } from '../../actions/userProjects';
import UserProfile from './UserProfile';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: state.userProfile,
  userProjects: state.userProjects,
  allProjects: get(state, 'allProjects'),
  allTeams: state.allTeamsData,
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
