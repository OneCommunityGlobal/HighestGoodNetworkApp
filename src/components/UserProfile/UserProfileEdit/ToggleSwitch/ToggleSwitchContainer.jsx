import { connect } from 'react-redux';
import { get } from 'lodash';

import { putUserProfile } from '../../../../actions/userProfile';
import ToggleSwitch from './ToggleSwitch';

const mapStateToProps = state => ({
  userProfile: get(state, 'userProfile'),
});

const mapDispatchToProps = { putUserProfile };

export default connect(mapStateToProps, mapDispatchToProps)(ToggleSwitch);
