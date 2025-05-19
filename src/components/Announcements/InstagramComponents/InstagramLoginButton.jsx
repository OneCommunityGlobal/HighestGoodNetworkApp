import { Component } from 'react';

class InstagramLoginButton extends Component {
  buildCodeRequestURL = () => {
    const { appId, redirectUri, scope } = this.props;
    const uri = encodeURIComponent(redirectUri || window.location.href);
    scope.replace(/%2C/g, ',');

    return `https://api.instagram.com/oauth/authorize?app_id=${appId}&redirect_uri=${uri}&scope=${scope}&response_type=code`;
  };

  handleLoginClick = () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      this.buildCodeRequestURL(),
      'instagram-login-popup',
      `width=${width},height=${height},left=${left},top=${top},toolbar=0,location=0,menubar=0,scrollbars=1`,
    );

    if (popup) {
      const checkPopupClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopupClosed);

          if (this.props.onLoginSuccess && typeof this.props.onLoginSuccess === 'function') {
            this.props.onLoginSuccess();
          }
        }
      }, 500);
    } else if (this.props.onLoginFailure && typeof this.props.onLoginFailure === 'function') {
      this.props.onLoginFailure();
    }
  };

  render() {
    return (
      <button
        type="button"
        className={this.props.className || 'instagram-login-button'}
        onClick={this.handleLoginClick}
      >
        {this.props.buttonText || 'Login with Instagram'}
      </button>
    );
  }
}

export default InstagramLoginButton;
