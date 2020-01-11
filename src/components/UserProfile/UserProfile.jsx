import React, { Component } from 'react'
import Loading from '../common/Loading'
import { getjwt } from '../../services/loginService'

import cx from 'classnames'
import Memberships from '../Memberships'
import ProfileLinks from '../ProfileLinks'
import Joi from 'joi'
class UserProfile extends Component {
  state = {
    isLoading: true,
    error: '',
    userProfile: {},
    firstNameError: '',
    lastNameError: ''
  }

  async componentDidMount() {
    await this.props.getCurrentUser(getjwt())
    let userId = this.props.match.params.userId
    await this.props.getUserProfile(userId)
    if (this.props.userProfile.firstName.length) {
      this.setState({ isLoading: false, userProfile: this.props.userProfile })
    }
    //console.log(this.props.userProfile)
  }
  componentWillUnmount() {
    this.props.clearUserProfile()
  }

  // componentDidUpdate() {
  //   let userProfile = this.props.userProfile
  //   if (userProfile && this.state.isLoading === true) {
  //     this.setState({ isLoading: false })
  //   }
  // }

  teamsSchema = {
    _id: Joi.string().required(),
    teamName: Joi.string().required()
  }
  projectsSchema = {
    _id: Joi.string().required(),
    projectName: Joi.string().required()
  }

  activeOptions = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' }
  ]

  allowedRoles = [
    { _id: 'Administrator', name: 'Administrator' },
    { _id: 'Core Team', name: 'Core Team' },
    { _id: 'Manager', name: 'Manager' },
    { _id: 'Volunteer', name: 'Volunteer' }
  ]

  handleFirstNameChange = event => {
    this.setState({
      userProfile: {
        ...this.state.userProfile,
        firstName: event.target.value.trim()
      },
      firstNameError: event.target.value ? '' : 'First Name cannot be empty '
    })
  }

  handleLastNameChange = event => {
    this.setState({
      userProfile: {
        ...this.state.userProfile,
        lastName: event.target.value.trim()
      },
      lastNameError: event.target.value ? '' : 'Last Name cannot be empty '
    })
  }

  handleSubmit = async event => {
    event.preventDefault()

    await this.props.updateUserProfile(
      this.props.match.params.userId,
      this.state.userProfile
    )
  }

  render() {
    if (this.state.isLoading === true) {
      return <Loading />
    }

    let { userId: targetUserId } = this.props.match.params
    let { userid: requestorId, role: requestorRole } = this.props.user

    const { firstName, lastName } = this.state.userProfile
    const { firstNameError, lastNameError } = this.state

    const {
      teams,
      projects,
      personalLinks,
      adminLinks,
      email,
      isActive,
      weeklyComittedHours,
      role
    } = this.props

    let isUserSelf = targetUserId === requestorId
    let canEditFields = isUserAdmin || isUserSelf
    const isUserAdmin = requestorRole === 'Administrator'
    const { error } = this.state

    return (
      <React.Fragment>
        <div className='container'>
          <div className='row my-auto'>
            <div className='col-md-4'></div>
            <div className='col-md-8'>
              <div className='form-row'>
                <div className={cx('form-group', 'col-md-4')}>
                  <label htmlFor='firstName'>First Name:</label>
                  <input
                    id={'firstName'}
                    type='text'
                    name={'firstName'}
                    className={`form-control`}
                    value={firstName}
                    readOnly={canEditFields ? null : true}
                    onChange={this.handleFirstNameChange}
                  />
                  {firstNameError && (
                    <div className='alert alert-danger mt-1'>
                      {firstNameError}
                    </div>
                  )}
                </div>
                <div className={cx('form-group', 'col-md-4')}>
                  <label htmlFor='lastName'>Last Name:</label>
                  <input
                    id={'lastName'}
                    type='text'
                    name={'lastName'}
                    className={`form-control`}
                    value={lastName}
                    readOnly={canEditFields ? null : true}
                    onChange={this.handleLastNameChange}
                  />
                  {lastNameError && (
                    <div className='alert alert-danger mt-1'>
                      {lastNameError}
                    </div>
                  )}
                </div>
                <div className='form-group'>
                  {this.activeOptions.map(item => (
                    <div
                      className='form-check form-check-inline'
                      key={item.value}
                    >
                      <input
                        type='radio'
                        value={item.value}
                        name={'isActive'}
                        className='form-check-input'
                        checked={item.value === isActive ? true : null}
                        disabled={canEditFields ? null : true}
                      />
                      <label
                        htmlFor={item.value.toString()}
                        className='form-check-label'
                      >
                        {item.label}
                      </label>
                    </div>
                  ))}

                  {error && <div className='alert alert-danger'>{error}</div>}
                </div>
              </div>
              <div className='form-row'>
                <div className={cx('form-group', 'col-md-4')}>
                  <label htmlFor='email'>Email:</label>
                  <input
                    id={'email'}
                    type='email'
                    name={'email'}
                    className={`form-control`}
                    value={email}
                    readOnly={canEditFields ? null : true}
                  />
                  {error && (
                    <div className='alert alert-danger mt-1'>{error}</div>
                  )}
                </div>

                <div className={cx('form-group', 'col-md-4')}>
                  <label htmlFor={'role'}>Role:</label>

                  <select
                    value={role}
                    name={'role'}
                    id={'role'}
                    readOnly={canEditFields ? null : true}
                    className='form-control'
                  >
                    <option value=''>Please select a Role:</option>
                    {this.allowedRoles.map(item => (
                      <option value={item._id} key={item._id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  {error && <div className='alert alert-danger'>{error}</div>}
                </div>

                <div className={cx('form-group', 'col-md-4')}>
                  <label htmlFor='weeklyComittedHours'>
                    Weekly Comitted Hours:
                  </label>
                  <input
                    id={'weeklyComittedHours'}
                    type='number'
                    name={'weeklyComittedHours'}
                    className={`form-control`}
                    value={weeklyComittedHours}
                    readOnly={isUserAdmin ? null : true}
                  />
                  {error && (
                    <div className='alert alert-danger mt-1'>{error}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className='row mt-3'>
            <ProfileLinks
              canEdit={isUserAdmin}
              data={adminLinks}
              label='Admin'
              handleProfileLinks={this.handleCollection}
              collection='adminLinks'
            />
          </div>
          <div className='row mt-3'>
            <ProfileLinks
              canEdit={canEditFields}
              data={personalLinks}
              label='Social/Professional'
              // handleProfileLinks={this.handleCollection}
              collection='personalLinks'
            />
          </div>
          <div className='row mt-3'>
            <div className='col-6'>
              <Memberships
                schema={this.teamsSchema}
                canEdit={isUserAdmin}
                data={teams}
                label='Team'
                collection='teams'
                //handleDelete={this.handleCollection}
                // handleBulkUpdates={this.handleMemberships}
              />
            </div>
            <div className='col-6'>
              <Memberships
                schema={this.projectsSchema}
                canEdit={isUserAdmin}
                data={projects}
                label='Project'
                collection='projects'
                //handleDelete={this.handleCollection}
                //handleBulkUpdates={this.handleMemberships}
              />
            </div>
          </div>
          <button className='btn btn-primary' onClick={this.handleSubmit}>
            {'Submit'}
          </button>
        </div>
      </React.Fragment>
    )
  }
}

export default UserProfile
