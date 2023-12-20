import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { updatePassword } from '../../actions/updatePassword';
import { logoutUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';
import Form from '../common/Form';


class UpdatePassword extends Form {
  state = {
    data: { currentpassword: '', newpassword: '', confirmnewpassword: '' },
    errors: {},
    showPassword: { currentpassword: false, newpassword: false, confirmnewpassword: false }
  };
  
  togglePasswordVisibility = (field) => {
    this.setState(prevState => ({
      showPassword: {
        ...prevState.showPassword,
        [field]: !prevState.showPassword[field]
      }
    }));
  }
  

  componentDidMount() {}

  componentDidUpdate(prevProps) {
    if (prevProps.errors.error !== this.props.errors.error) {
      this.setState({ errors: this.props.errors });
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
  }

  schema = {
    currentpassword: Joi.string()
      .required()
      .label('Current Password'),
    newpassword: Joi.string()
      .regex(/(?=^.{8,}$)(?=.*\d)(?=.*\W)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
      .required()
      .disallow(Joi.ref('currentpassword'))
      .label('New Password')
      .options({
        language: {
          any: {
            invalid: 'should not be same as old password',
          },
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

  doSubmit = async () => {
    const { currentpassword, newpassword, confirmnewpassword } = {
      ...this.state.data,
    };
    const { userId } = this.props.match.params;
    const data = { currentpassword, newpassword, confirmnewpassword };

    const status = await this.props.updatePassword(userId, data);
    if (status === 200) {
      toast.success(
        'Your password has been updated. You will be logged out and directed to login page where you can login with your new password.',
        {
          onClose: () => {
            this.props.logoutUser();
            this.props.history.replace('/login');
          },
        },
      );
    } else if (status === 400) {
      const { errors } = this.state;
      errors.currentpassword = this.props.errors.error;
      this.setState({ errors });
    } else {
      toast.error('Something went wrong. Please contact your administrator.');
    }
  };

  render() {
    return (
        <div className="container mt-5">
            <h2 className="text-2xl font-bold mb-5">Change Password</h2>
            <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <label htmlFor="currentpassword" className="text-sm font-medium text-gray-700 mr-2">Current Password:</label>
                        <i className={`fa ${this.state.showPassword.currentpassword ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer`} onClick={() => this.togglePasswordVisibility('currentpassword')}></i>
                    </div>
                    {this.renderInput({ name: 'currentpassword', type: this.state.showPassword.currentpassword ? 'text' : 'password' })}
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <label htmlFor="newpassword" className="text-sm font-medium text-gray-700 mr-2">New Password:</label>
                        <i className={`fa ${this.state.showPassword.newpassword ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer`} onClick={() => this.togglePasswordVisibility('newpassword')}></i>
                    </div>
                    {this.renderInput({ name: 'newpassword', type: this.state.showPassword.newpassword ? 'text' : 'password' })}
                </div>

                <div className="mb-4">
                    <div className="flex justify-between items-center">
                        <label htmlFor="confirmnewpassword" className="text-sm font-medium text-gray-700 mr-2">Confirm Password:</label>
                        <i className={`fa ${this.state.showPassword.confirmnewpassword ? 'fa-eye-slash' : 'fa-eye'} cursor-pointer`} onClick={() => this.togglePasswordVisibility('confirmnewpassword')}></i>
                    </div>
                    {this.renderInput({ name: 'confirmnewpassword', type: this.state.showPassword.confirmnewpassword ? 'text' : 'password' })}
                </div>

                {this.renderButton('Submit')}
            </form>
        </div>
    );
}

}

const mapStateToProps = state => ({
  errors: state.errors,
});

export default withRouter(
  connect(mapStateToProps, {
    logoutUser,
    updatePassword,
    clearErrors,
  })(UpdatePassword),
);
