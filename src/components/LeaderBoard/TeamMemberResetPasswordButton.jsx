import React, { useState } from 'react';
import { Button, Tooltip } from 'reactstrap';
import { toast } from 'react-toastify';
import { boxStyle, boxStyleDark } from '../../styles';
import { resetPassword } from '../../services/userProfileService';
import { cantUpdateDevAdminDetails } from '../../utils/permissions';
import ResetPasswordPopup from '../UserManagement/ResetPasswordPopup';

const TeamMemberResetPasswordButton = ({
  user,
  authEmail,
  canUpdatePassword,
  darkMode,
  isSmallButton = true,
}) => {
  const [resetPopupOpen, setResetPopupOpen] = useState(false);
  const [resetPasswordTooltipOpen, setResetPasswordTooltipOpen] = useState(false);

  const toggleResetPasswordTooltip = () => {
    setResetPasswordTooltipOpen(!resetPasswordTooltipOpen);
  };

  const onResetClick = () => {
    if (cantUpdateDevAdminDetails(user.email, authEmail)) {
      alert(
        "STOP! YOU SHOULDN'T BE TRYING TO CHANGE THIS PASSWORD. " +
          "You shouldn't even be using this account except to create your own accounts to use. " +
          'Please re-read the Local Setup Doc to understand why and what you should be doing instead of what you are trying to do now.',
      );
      setResetPopupOpen(false);
    } else {
      setResetPopupOpen(true);
    }
  };

  const resetPopupClose = () => {
    setResetPopupOpen(false);
  };

  const resetPasswordHandler = (newPassword, confirmPassword) => {
    const userData = { newpassword: newPassword, confirmnewpassword: confirmPassword };
    resetPassword(user._id, userData)
      .then(() => {
        toast.success('Password reset action has been completed.');
        setResetPopupOpen(false);
      })
      .catch(() => {
        toast.error('Password reset failed ! Please try again with a strong password.');
      });
  };

  return (
    <>
      <ResetPasswordPopup
        open={resetPopupOpen}
        onClose={resetPopupClose}
        onReset={resetPasswordHandler}
      />
      <>
        {!canUpdatePassword ? (
          <Tooltip
            placement="bottom"
            isOpen={resetPasswordTooltipOpen}
            target={`btn-reset-password-${user._id}`}
            toggle={toggleResetPasswordTooltip}
          >
            You don&apos;t have permission to reset the password
          </Tooltip>
        ) : (
          ''
        )}
        <Button
          outline={!darkMode}
          color="primary"
          className={`btn btn-outline-success mr-1${isSmallButton ? ' btn-sm' : ''}`}
          style={
            darkMode
              ? {
                  boxShadow: '0 0 0 0',
                  minWidth: '80px',
                  fontWeight: 'bold',
                  backgroundColor: '#3a506b',
                }
              : { ...boxStyle, minWidth: '80px' }
          }
          onClick={onResetClick}
          id={`btn-reset-password-${user._id}`}
          disabled={!canUpdatePassword}
        >
          Reset
        </Button>
      </>
    </>
  );
};

export default TeamMemberResetPasswordButton;
