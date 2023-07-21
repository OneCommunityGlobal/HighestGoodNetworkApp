import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Form from '../common/Form';
import Joi from 'joi';
import { toast } from 'react-toastify';
import { updatePassword } from '../../actions/updatePassword';
import { logoutUser } from '../../actions/authActions';
import { clearErrors } from '../../actions/errorsActions';

class UpdatePassword extends Form {
  state = {
    data: { currentpassword: '', newpassword: '', confirmnewpassword: '' },
    errors: {},
  };

  componentDidMount() {
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
    currentpassword: Joi.string()
      .required()
      .label('Current Password'),
    newpassword: Joi.string()
      .regex(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)
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
    let userId = this.props.match.params.userId;
    let data = { currentpassword, newpassword, confirmnewpassword };

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
      let { errors } = this.state;
      errors['currentpassword'] = this.props.errors.error;
      this.setState({ errors });
    } else {
      toast.error('Something went wrong. Please contact your administrator.');
    }
  };

  render() {
    return (
      <div className="container mt-5">
        <h2>Change Password</h2>

        <form className="col-md-6 xs-12" onSubmit={e => this.handleSubmit(e)}>
          {this.renderInput({
            name: 'currentpassword',
            label: 'Current Password:',
            type: 'password',
          })}
          {this.renderInput({
            name: 'newpassword',
            label: 'New Password:',
            type: 'password',
          })}
          {this.renderInput({
            name: 'confirmnewpassword',
            label: 'Confirm Password:',
            type: 'password',
            'data-refers': 'newpassword',
          })}
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
