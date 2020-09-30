import { connect } from 'react-redux';
import _ from 'lodash';
import {
  getUserProfile,
  updateUserProfile,
  clearUserProfile,

} from '../../actions/userProfile';
import { getUserTeamMembers } from '../../actions/team';
import { getAllUserTeams } from '../../actions/allTeamsAction';
import { fetchAllProjects } from '../../actions/projects'
import { updateTeamsList } from '../../actions/userProfile'
import UserProfile from './UserProfile';

const mapStateToProps = state => ({
  auth: state.auth,
  userProfile: _.get(state, 'userProfile'),
  user: _.get(state, 'user', {}),
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
});

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getUserTeamMembers,
  getAllUserTeams,
  fetchAllProjects,
  updateTeamsList,

})(UserProfile);
