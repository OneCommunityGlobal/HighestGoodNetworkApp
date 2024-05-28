import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { forcePasswordUpdate } from '../../actions/updatePassword';
import { clearErrors } from '../../actions/errorsActions';
import Form from '../common/Form';

export class ForcePasswordUpdate extends Form {
  state = {
    data: { newpassword: '', confirmnewpassword: '' },
    errors: {},
  };

  componentDidMount() {
    // document.title = "Force Update Password";
  }

  componentDidUpdate(prevProps) {
    if (prevProps.errors.error !== this.props.errors.error) {
      this.setState({ errors: this.props.errors });
    }
  }

  componentWillUnmount() {
    this.props.clearErrors();
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

  doSubmit = async () => {
    const { newpassword } = {
      ...this.state.data,
    };

    const { userId } = this.props.match.params;
    const data = { userId, newpassword };
    const status = await this.props.forcePasswordUpdate(data);
    if (status === 200) {
      toast.success(
        'You will now be directed to the login page where you can login with your new password.',
        {
          onClose: () => this.props.history.replace('/login'),
        },
      );
    } else {
      toast.error('Something went wrong. Please contact your administrator.');
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
