import React from 'react';
import { cantUpdateDevAdminDetails } from 'utils/permissions';
import { Button } from 'reactstrap';
import { toast } from 'react-toastify';
import { boxStyle } from 'styles';
import { resetPassword } from '../../services/userProfileService';
import ResetPasswordPopup from './ResetPasswordPopup';

class ResetPasswordButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resetPopupOpen: false,
    };
  }

  onResetClick = () => {
    const { user, authEmail } = this.props;
    if (cantUpdateDevAdminDetails(user.email, authEmail)) {
      alert(
        'STOP! YOU SHOULDN’T BE TRYING TO CHANGE THIS PASSWORD. ' +
          'You shouldn’t even be using this account except to create your own accounts to use. ' +
          'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
      );
      this.setState({
        resetPopupOpen: false,
      });
    } else {
      this.setState({
        resetPopupOpen: true,
      });
    }
  };

  resetPopupClose = () => {
    this.setState({
      resetPopupOpen: false,
    });
  };

  resetPassword = (newPassword, confimrPassword) => {
    const userData = { newpassword: newPassword, confirmnewpassword: confimrPassword };
    const { user } = this.props;
    resetPassword(user._id, userData)
      .then(() => {
        toast.success('Password reset action has been completed.');
        this.setState({
          resetPopupOpen: false,
        });
      })
      .catch(() => {
        toast.error('Password reset failed ! Please try again with a strong password.');
      });
  };

  render() {
    const { isSmallButton, resetPopupOpen } = this.props;
    return (
      <>
        <ResetPasswordPopup
          open={resetPopupOpen}
          onClose={this.resetPopupClose}
          onReset={this.resetPassword}
        />
        <Button
          outline
          color="primary"
          className={`btn  btn-outline-success mr-1${isSmallButton ? ' btn-sm' : ''}`}
          style={{ ...boxStyle, minWidth: '115px' }}
          onClick={this.onResetClick}
        >
          Reset Password
        </Button>
      </>
    );
  }
}

export default ResetPasswordButton;
