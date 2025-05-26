import { Component } from 'react';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';

class LoginButton extends Component {
  buildCodeRequestURL = async () => {
    try {
      const response = await axios.get(`${ENDPOINTS.GET_IMGUR_AUTH_URL}`);
      if (response.success === false) {
        throw new Error('Failed to fetch auth URL');
      }

      return response.data.authUrl;
    } catch (error) {
      if (this.props.onLoginFailure && typeof this.props.onLoginFailure === 'function') {
        this.props.onLoginFailure();
      }

      return null;
    }
  };

  handleLoginClick = async () => {
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    try {
      const authUrl = await this.buildCodeRequestURL();
      if (!authUrl) {
        throw new Error('Failed to build auth URL');
      }

      const popup = window.open(
        authUrl,
        'imgur-login-popup',
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
    } catch (error) {
      if (this.props.onLoginFailure && typeof this.props.onLoginFailure === 'function') {
        this.props.onLoginFailure();
      }
    }
  };

  render() {
    return (
      <button
        type="button"
        className={this.props.className || 'login-button'}
        onClick={this.handleLoginClick}
      >
        {this.props.buttonText || 'Login'}
      </button>
    );
  }
}

export default LoginButton;