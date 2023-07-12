import { connect } from 'react-redux';
import PopUpBar from './PopUpBar';

const mapStateToProps = state => ({
  auth: state.auth.user,
  userProfile: state.userProfile,
});

export default connect(mapStateToProps)(PopUpBar);
