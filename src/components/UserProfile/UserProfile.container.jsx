import { getCurrentUser } from '../../actions'
import {
  getUserProfile,
  updateUserProfile,
  clearUserProfile
} from '../../actions/userProfile'
import { connect } from 'react-redux'
import _ from 'lodash'

import UserProfile from './UserProfile'
const mapStateToProps = state => {
  return {
    userProfile: _.get(state, 'userProfile'),
    user: _.get(state, 'user', {}),
    teams: _.get(state, 'userProfile.teams', []),
    projects: _.get(state, 'userProfile.projects', []),
    personalLinks: _.get(state, 'userProfile.personalLinks', []),
    adminLinks: _.get(state, 'userProfile.adminLinks', []),
    firstName: _.get(state, 'userProfile.firstName', ''),
    lastName: _.get(state, 'userProfile.lastName', ''),
    email: _.get(state, 'userProfile.email', ''),
    isActive: _.get(state, 'userProfile.isActive', false),
    weeklyComittedHours: _.get(state, 'userProfile.weeklyComittedHours', 0),
    role: _.get(state, 'userProfile.role', '')
  }
}

export default connect(mapStateToProps, {
  getCurrentUser,
  getUserProfile,
  clearUserProfile,
  updateUserProfile
})(UserProfile)
