import { connect } from 'react-redux'
import _ from 'lodash'

import UserLinks from './UserLinks'

const mapStateToProps = state => {
	console.log(state.userProfile)
	return {
		personalLinks: _.get(state, 'userProfile.personalLinks', []),
		adminLinks: _.get(state, 'userProfile.adminLinks', [])
	}
}

export default connect(mapStateToProps)(UserLinks)
