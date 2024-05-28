import Joi from 'joi';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
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
        this.props.history.push('/dashboard');
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
    const email = this.state.data.email.replace(/[A-Z]/g, char => char.toLowerCase());
    const { password } = this.state.data;
    this.props.loginUser({ email, password });
    this.setState({ errors: this.props.errors });
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
            {this.renderButton({ label: 'Submit', darkMode })}
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
