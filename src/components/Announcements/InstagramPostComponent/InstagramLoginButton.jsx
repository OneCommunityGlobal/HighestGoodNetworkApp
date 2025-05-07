import React, { Component } from 'react';

class InstagramLoginButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCompleted: false,
      popup: null
    };
  }

  buildCodeRequestURL = () => {
    const { appId, redirectUri, scope } = this.props;
    const uri = encodeURIComponent(redirectUri || window.location.href);
    // const scopeStr = Array.isArray(scope) ? scope.join(",") : "user_profile";
    // const scopeStr = Array.isArray(scope) ? scope.replace('%2C', ',') : "user_profile";
    scope.replace(/%2C/g, ',');
    console.log("InstagramLoginButton buildCodeRequestURL: ", appId, uri, scope);

    return `https://api.instagram.com/oauth/authorize?app_id=${appId}&redirect_uri=${uri}&scope=${scope}&response_type=code`;
  }

  handleLoginClick = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      this.buildCodeRequestURL(),
      'instagram-login-popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1`
    );

    if (popup) {
      console.log("instagram login popup opened with props: ", this.props);

      if (this.props.setUrlButtonVisibility) {
        this.props.setUrlButtonVisibility(true);
      }

      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);

          if (this.props.setUrlButtonVisibility && !this.props.codeUrl) {
            this.props.setUrlButtonVisibility(false);
          }

          if (this.props.onLoginSuccess && typeof this.props.onLoginSuccess === 'function') {
            this.props.onLoginSuccess();
          }
          
        }
      }, 500);

    } else {
      console.error("Failed to open popup");
    }
  };

  render() {
    return (
      <button 
        className={this.props.className || "instagram-login-button"}
        onClick={this.handleLoginClick}
      >
        {this.props.buttonText || "Login with Instagram"}
      </button>
    );
  }
}

export default InstagramLoginButton;