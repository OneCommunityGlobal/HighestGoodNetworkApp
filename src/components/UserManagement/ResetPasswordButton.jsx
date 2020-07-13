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
      <button type="button" className="btn  btn-outline-success btn-sm"
        onClick={this.onResetClick}>{this.props.buttonText}</button>
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
    })
  }

}

export default ResetPasswordButton;