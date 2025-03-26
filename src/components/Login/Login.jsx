import Joi from 'joi';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import NetlifyPoweredLink from 'components/Footer/NetlifyPoweredLink';
import Form from '../common/Form/Form';
import { loginUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';

export class Login extends Form {
  state = {
    data: { email: '', password: '' },
    errors: {},
  };

  schema = {
    email: Joi.string()
      .email()
      .required()
      .label('Email'),
    password: Joi.string()
      .required()
      .label('Password'),
  };

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/');
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.auth !== this.props.auth) {
      if (this.props.auth.user.new) {
        const url = `/forcePasswordUpdate/${this.props.auth.user.userId}`;
        this.props.history.push(url);
      } else if (this.props.auth.isAuthenticated) {
        const redirectPath = this.props.location?.state?.from?.pathname;
        if (redirectPath && redirectPath.includes('/hgnform')) {
          this.props.history.push(redirectPath);
        } else {
          this.props.history.push('/dashboard');
        }
      }
    }
    if (prevProps.errors.email !== this.props.errors.email) {
      this.setState({ errors: this.props.errors });
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  doSubmit = async () => {
    const { email, password } = this.state.data;
    const formattedEmail = email.replace(/[A-Z]/g, char => char.toLowerCase());
    await this.props.loginUser({ email: formattedEmail, password });
    if (this.props.errors) {
      this.setState({ errors: this.props.errors });
    }
  };

  render() {
    const { darkMode } = this.props;
    return (
      <div
        className={`pt-5 h-100 container-fluid d-flex flex-column align-items-center ${
          darkMode ? 'bg-oxford-blue' : ''
        }`}
      >
        <h2>Please Sign in</h2>
        <form className="col-md-4 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({ name: 'email', label: 'Email:', darkMode })}
          {this.renderInput({
            name: 'password',
            label: 'Password:',
            type: 'password',
            darkMode,
          })}
          <div>
            {this.renderButton({
              name: 'submit',
              id: 'submit',
              label: 'Submit',
              type: 'submit',
              darkMode,
            })}
            {/* <button
              id="submit"
              name="submit"
              type="submit"
              className={`btn btn-primary mt-2 ${darkMode ? 'btn-dark' : ''}`}
              style={{ width: '100%' }}
            >
              Submit
            </button> */}
            <Link to="forgotpassword">
              <span
                style={{
                  color: darkMode ? 'red' : 'blue',
                  textDecorationLine: 'underline',
                  lineHeight: '50px',
                  float: 'right',
                  cursor: 'pointer',
                }}
              >
                forgot password?
              </span>
            </Link>
          </div>
        </form>
        <footer>
          <NetlifyPoweredLink />
        </footer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  darkMode: state.theme.darkMode,
});

export default withRouter(
  connect(mapStateToProps, {
    loginUser,
    clearErrors,
  })(Login),
);
