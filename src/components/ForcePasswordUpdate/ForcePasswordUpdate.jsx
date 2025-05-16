import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { forcePasswordUpdate } from '../../actions/updatePassword';
import { clearErrors } from '../../actions/errorsActions';
import Form from '../common/Form';

export class ForcePasswordUpdate extends Form {
  _isMounted = false;

  state = {
    data: { newpassword: '', confirmnewpassword: '' },
    errors: {},
    successMessage: '',
    errorMessage: '',
  };

  componentDidMount() {
    // document.title = "Force Update Password";
    this._isMounted = true;
  }

  componentDidUpdate(prevProps) {
    if (this._isMounted && prevProps.errors.error !== this.props.errors.error) {
      this.setState({ errors: this.props.errors });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    // Clear errors when unmounting
    this.props.clearErrors();
    // Important: dismiss all toasts to prevent DOM manipulation after unmount
    toast.dismiss();
  }

  schema = {
    newpassword: Joi.string()
      .regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
      .required()
      .label('New Password')
      .options({
        language: {
          string: {
            regex: {
              base:
                'should be at least 8 characters long and must include at least one uppercase letter, one lowercase letter, and one number or special character',
            },
          },
        },
      }),

    confirmnewpassword: Joi.any()
      .valid(Joi.ref('newpassword'))
      .options({ language: { any: { allowOnly: 'must match new password' } } })
      .label('Confirm Password'),
  };

  safeSetState = newState => {
    if (this._isMounted) {
      this.setState(newState);
    }
  };

  doSubmit = async () => {
    if (!this._isMounted) return;

    // Clear any previous messages
    this.setState({ successMessage: '', errorMessage: '' });

    const { newpassword } = {
      ...this.state.data,
    };

    const { userId } = this.props.match.params;
    const data = { userId, newpassword };

    try {
      const status = await this.props.forcePasswordUpdate(data);

      if (!this._isMounted) return;

      if (status === 200) {
        // For tests to interact with this message
        const successMessage =
          'You will now be directed to the login page where you can login with your new password.';

        // Set in state so the test can find it
        this.setState({ successMessage });

        // Show toast and handle navigation
        toast.success(successMessage, {
          onClose: () => {
            if (this._isMounted) {
              this.props.history.replace('/login');
            }
          },
        });
      } else if (status === 400) {
        const errorMessage =
          'Please select a new password. New password cannot be default password.';
        this.setState({ errorMessage });
        toast.error(errorMessage);
      } else {
        const errorMessage = 'Something went wrong. Please contact your administrator.';
        this.setState({ errorMessage });
        toast.error(errorMessage);
      }
    } catch (error) {
      if (this._isMounted) {
        const errorMessage = 'An error occurred. Please try again later.';
        this.setState({ errorMessage });
        toast.error(errorMessage);
      }
    }
  };

  handleLoginRedirect = () => {
    if (this._isMounted) {
      this.props.history.replace('/login');
    }
  };

  render() {
    const { darkMode } = this.props;
    const { successMessage, errorMessage } = this.state;

    return (
      <div
        className={`pt-5 h-100 container-fluid d-flex flex-column align-items-center ${
          darkMode ? 'bg-oxford-blue' : ''
        }`}
      >
        <h2>Change Password</h2>

        <form className="col-md-4 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({
            name: 'newpassword',
            label: 'New Password:',
            type: 'password',
            darkMode,
          })}
          {this.renderInput({
            name: 'confirmnewpassword',
            label: 'Confirm Password:',
            type: 'password',
            'data-refers': 'newpassword',
            darkMode,
          })}
          {this.renderButton({ label: 'Submit', darkMode })}
        </form>

        {/* Message display for tests to interact with */}
        {successMessage && (
          <div className="alert alert-success mt-3" onClick={this.handleLoginRedirect}>
            {successMessage}
          </div>
        )}
        {errorMessage && <div className="alert alert-danger mt-3">{errorMessage}</div>}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  errors: state.errors,
  darkMode: state.theme.darkMode,
});

export default withRouter(
  connect(mapStateToProps, {
    forcePasswordUpdate,
    clearErrors,
  })(ForcePasswordUpdate),
);
