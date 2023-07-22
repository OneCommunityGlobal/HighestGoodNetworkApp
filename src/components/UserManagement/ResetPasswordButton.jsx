import React from 'react';
import ResetPasswordPopup from './ResetPasswordPopup';
import { resetPassword } from '../../services/userProfileService';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';

class ResetPasswordButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resetPopupOpen: false,
    };
  }

  render() {
    return (
      <React.Fragment>
        <ResetPasswordPopup
          open={this.state.resetPopupOpen}
          onClose={this.resetPopupClose}
          onReset={this.resetPassword}
        />
        <Button
          outline
          color="primary"
          className={'btn  btn-outline-success mr-1' + (this.props.isSmallButton ? ' btn-sm' : '')}
          style={{ minWidth: '115px' }}
          onClick={this.onResetClick}
        >
          {'Reset Password'}
        </Button>
      </React.Fragment>
    );
  }

  onResetClick = () => {
    this.setState({
      resetPopupOpen: true,
    });
  };

  resetPopupClose = () => {
    this.setState({
      resetPopupOpen: false,
    });
  };

  resetPassword = (newPassword, confimrPassword) => {
    let userData = { newpassword: newPassword, confirmnewpassword: confimrPassword };
    resetPassword(this.props.user._id, userData)
      .then(res => {
        toast.success('Password reset action has been completed.');
        this.setState({
          resetPopupOpen: false,
        });
      })
      .catch(error => {
        toast.error('Password reset failed ! Please try again with a strong password.');
      });
  };
}

export default ResetPasswordButton;
