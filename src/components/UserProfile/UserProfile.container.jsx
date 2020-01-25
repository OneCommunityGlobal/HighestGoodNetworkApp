import { connect } from 'react-redux'
import _ from 'lodash'
import {
	getUserProfile,
	updateUserProfile,
	clearUserProfile
} from '../../actions/userProfile'
import { getUserTeamMembers } from '../../actions/team'

import UserProfile from './UserProfile'

const mapStateToProps = state => ({
	auth: state.auth,
	userProfile: _.get(state, 'userProfile'),
	user: _.get(state, 'user', {})
})

export default connect(mapStateToProps, {
	getUserProfile,
	clearUserProfile,
	updateUserProfile,
	getUserTeamMembers
})(UserProfile)
