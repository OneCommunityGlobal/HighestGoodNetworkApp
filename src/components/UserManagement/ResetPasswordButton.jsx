import React from 'react';
import { Button, Tooltip } from 'reactstrap';
import { toast } from 'react-toastify';
import { boxStyle } from '../../styles';
import { resetPassword } from '../../services/userProfileService';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import ResetPasswordPopup from './ResetPasswordPopup';

class ResetPasswordButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resetPopupOpen: false,
      resetPasswordTooltipOpen: false,
    };
  }

  toggleResetPasswordTooltip = () => {
    this.setState(prevState => ({
      resetPasswordTooltipOpen: !prevState.resetPasswordTooltipOpen,
    }));
  };

  onResetClick = () => {
    if (cantUpdateDevAdminDetails(this.props.user.email, this.props.authEmail)) {
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
    resetPassword(this.props.user._id, userData)
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
    return (
      <>
        <ResetPasswordPopup
          open={this.state.resetPopupOpen}
          onClose={this.resetPopupClose}
          onReset={this.resetPassword}
        />
        <>
          {!this.props.canResetPassword ? (
            <Tooltip
              placement="bottom"
              isOpen={this.state.resetPasswordTooltipOpen}
              target={`btn-reset-password-${this.props.user._id}`}
              toggle={this.toggleResetPasswordTooltip}
            >
              You don&apos;t have permission to reset the password
            </Tooltip>
          ) : (
            ''
          )}
          <Button
            outline={!this.props.darkMode}
            color="primary"
            className={`btn  btn-outline-success mr-1${this.props.isSmallButton ? ' btn-sm' : ''}`}
            style={
              this.props.darkMode
                ? { boxShadow: '0 0 0 0', minWidth: '115px', fontWeight: 'bold' }
                : { ...boxStyle, minWidth: '115px' }
            }
            onClick={this.onResetClick}
            id={`btn-reset-password-${this.props.user._id}`}
            disabled={!this.props.canResetPassword}
          >
            Reset Password
          </Button>
        </>
      </>
    );
  }
}

export default ResetPasswordButton;
