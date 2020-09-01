import React from "react"
import ResetPasswordPopup from "./ResetPasswordPopup";
import { resetPassword } from '../../services/userProfileService';

class ResetPasswordButton extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      resetPopupOpen: false
    }
  }

  render() {
    return (<React.Fragment>
      <ResetPasswordPopup
        open={this.state.resetPopupOpen}
        onClose={this.resetPopupClose}
        onReset={this.resetPassword} />
      <button type="button" style={{ minWidth: "115px" }}
        className={"btn  btn-outline-success" + (this.props.isSmallButton ? " btn-sm" : "")}
        onClick={this.onResetClick}>{"Reset Password"}</button>
    </React.Fragment>)
  }

  onResetClick = () => {
    this.setState({
      resetPopupOpen: true
    })
  }

  resetPopupClose = () => {
    this.setState({
      resetPopupOpen: false
    })
  }

  resetPassword = (newPassword, confimrPassword) => {
    let userData = { newpassword: newPassword, confirmnewpassword: confimrPassword };
    resetPassword(this.props.user._id, userData).then(res => {
      alert("Password reset action has been completed.")
      this.setState({
        resetPopupOpen: false
      })
    }).catch(error => {
      alert("Password reset failed ! Please try again with a strong password.");
    })
  }

}

export default ResetPasswordButton;