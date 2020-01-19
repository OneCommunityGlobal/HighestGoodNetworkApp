import { connect } from 'react-redux'
import _ from 'lodash'

import { editFirstName } from '../../../actions/userProfile'
import SideBar from './SideBar'

const mapStateToProps = state => {
	return {
		firstName: _.get(state, 'userProfile.firstName', ''),
		profilePic: _.get(state, 'userProfile.profilePic', '')
	}
}

const mapDispatchToProps = { editFirstName }

export default connect(mapStateToProps, mapDispatchToProps)(SideBar)
