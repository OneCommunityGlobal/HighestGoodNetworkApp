import { connect } from 'react-redux';
import { get } from 'lodash';

import { editUserProfile } from '../../../../actions/userProfile';
import ToggleSwitch from './ToggleSwitch';

const mapStateToProps = state => ({
  userProfile: get(state, 'userProfile'),
});

const mapDispatchToProps = { editUserProfile };

export default connect(mapStateToProps, mapDispatchToProps)(ToggleSwitch);
