import { connect } from 'react-redux'
import _ from 'lodash'

import { editUserProfile } from '../../../actions/userProfile'
import SideBar from './SideBar'

const mapStateToProps = state => {
	return {
		userProfile: _.get(state, 'userProfile')
	}
}

const mapDispatchToProps = { editUserProfile }

export default connect(mapStateToProps, mapDispatchToProps)(SideBar)
