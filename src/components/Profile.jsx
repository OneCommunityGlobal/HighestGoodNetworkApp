import React from 'react'
import _ from 'lodash'
import Form from './common/form'
import Joi from 'joi'
import RenderInfringment from './RenderInfringment'
import ProfileLinks from './ProfileLinks'
import ShowSaveWarning from './common/ShowSaveWarning'
import Memberships from './Memberships'

class Profile extends Form {
  constructor(props) {
    super(props)
    this.state = {
      requestorId: props.requestorId,
      requestorRole: props.requestorRole,
      targetUserId: props.targetUserId,
      data: { ...props.userProfile },
      errors: {}
    }
    this.initialState = _.cloneDeep(this.state)
  }

  profileLinksSchema = {
    Name: Joi.string()
      .trim()
      .required(),
    Link: Joi.string()
      .trim()
      .uri()
      .required()
  }
  infringmentsSchema = {
    _id: Joi.string()
      .allow('')
      .optional(),
    date: Joi.string()
      .required()
      .label('Infringement Date'),
    description: Joi.string()
      .trim()
      .required()
      .label('Infringement Description')
  }
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

  schema = {
    _id: Joi.string()
      .allow('')
      .optional(),
    profilePic: Joi.string().label('Profile Picture'),
    firstName: Joi.string()
      .trim()
      .required()
      .min(2)
      .label('First Name'),
    lastName: Joi.string()
      .trim()
      .required()
      .min(2)
      .label('Last Name'),
    isActive: Joi.boolean()
      .default(true)
      .label('Active Status'),
    role: Joi.any()
      .allow(['Administrator', 'Core Team', 'Manager', 'Volunteer'])
      .default('Volunteer')
      .label('Role'),
    email: Joi.string()
      .trim()
      .email()
      .required()
      .label('Email'),
    weeklyComittedHours: Joi.number()
      .required()
      .min(0)
      .default(5)
      .label('Weekly Committed Hours'),
    infringments: Joi.array()
      .items(this.infringmentsSchema)
      .min(0)
      .max(5),
    bio: Joi.string()
      .allow('')
      .optional(),
    adminLinks: Joi.array()
      .items(this.profileLinksSchema)
      .min(0)
      .label('Administrative Links'),
    personalLinks: Joi.array()
      .items(this.profileLinksSchema)
      .min(0)
      .label('Personal Links'),
    teams: Joi.array()
      .items(this.teamsSchema)
      .min(0),
    projects: Joi.array()
      .items(this.projectsSchema)
      .min(0),
    phoneNumber: Joi.any().optional(),
    badges: Joi.array().min(0),
    badgeCollection: Joi.any().optional()
  }

  handleInfringment = (item, action, index = null) => {
    this.handleCollection('infringments', item, action, index)
  }
  handleMemberships = (collection, value) => {
    this.updateCollection(collection, value)
  }

  doSubmit = () => this.props.onSubmit(this.state.data)

  render() {
    let {
      firstName,
      lastName,
      profilePic,
      email,
      weeklyComittedHours,
      infringments,
      adminLinks,
      personalLinks,
      teams,
      projects
    } = { ...this.state.data }
    let { targetUserId, requestorId, requestorRole } = this.state
    let isUserAdmin = requestorRole === 'Administrator'
    let isUserSelf = targetUserId === requestorId
    let canEditFields = isUserAdmin || isUserSelf
    let infringmentslength = infringments ? infringments.length : 0

    return (
      <React.Fragment>
        <div className='container'>
          <form onSubmit={e => this.handleSubmit(e)}>
            <div className='row my-auto'>
              <div className='col-md-4'>
                <div className='form-row text-center'>
                  {this.renderImage({
                    name: 'currentprofilePic',
                    label: '',
                    className: 'profilepic',
                    type: 'image',
                    src: profilePic || '/defaultprofilepic.jpg'
                  })}
                  {canEditFields &&
                    this.renderFileUpload({
                      name: 'profilePic',
                      accept: 'image/png,image/jpeg, image/jpg',
                      maxSizeinKB: 50,
                      className: 'newProfilePic',
                      readAsType: 'data'
                    })}
                </div>
                <div className='form-row text-center ml-1'>
                  {!!targetUserId &&
                    this.renderLink({
                      label: 'View Timelog',
                      to: `/timelog/${targetUserId}`,
                      className: 'btn btn-info btn-sm text-center m-1'
                    })}
                </div>
                <div className='form-row text-center'>
                  {canEditFields &&
                    !!targetUserId &&
                    infringments.map((item, index) => (
                      <RenderInfringment
                        key={`${item.date}_${item.description}`}
                        infringment={item}
                        isUserAdmin={isUserAdmin}
                        handleInfringment={this.handleInfringment}
                        index={index}
                        schema={this.infringmentsSchema}
                      />
                    ))}

                  {canEditFields &&
                    !!targetUserId &&
                    _.times(5 - infringments.length, () => (
                      <RenderInfringment
                        key={infringmentslength++}
                        infringment={{ date: '', description: '' }}
                        isUserAdmin={isUserAdmin}
                        handleInfringment={this.handleInfringment}
                        schema={this.infringmentsSchema}
                      />
                    ))}
                </div>
              </div>
              <div className='col-md-8'>
                <div className='form-row'>
                  {this.renderInput({
                    name: 'firstName',
                    label: 'First Name:',
                    className: 'col-md-4',
                    value: firstName,
                    readOnly: canEditFields ? null : true
                  })}
                  {this.renderInput({
                    name: 'lastName',
                    label: 'Last Name:',
                    className: 'col-md-4',
                    value: lastName,
                    readOnly: canEditFields ? null : true
                  })}
                  {this.renderRadio({
                    name: 'isActive',
                    options: this.activeOptions,
                    disabled: canEditFields ? null : true
                  })}
                </div>

                <div className='form-row'>
                  {this.renderInput({
                    name: 'email',
                    label: 'Email:',
                    className: 'col-md-4',
                    value: email,
                    readOnly: canEditFields ? null : true
                  })}
                  {this.renderDropDown({
                    name: 'role',
                    label: 'Role:',
                    className: 'col-md-4',
                    options: this.allowedRoles,
                    readOnly: canEditFields ? null : true
                  })}
                  {this.renderInput({
                    name: 'weeklyComittedHours',
                    label: 'Weekly Comitted Hours:',
                    className: 'col-md-4',
                    value: weeklyComittedHours,
                    readOnly: isUserAdmin ? null : true,
                    type: 'number',
                    min: 0
                  })}
                </div>
              </div>
            </div>

            {this.isStateChanged() && <ShowSaveWarning />}
            <div className='row'>
              {this.renderRichTextEditor({
                label: 'Bio:',
                name: 'bio',
                className: 'w-100'
              })}
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
                handleProfileLinks={this.handleCollection}
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
                  handleDelete={this.handleCollection}
                  handleBulkUpdates={this.handleMemberships}
                />
              </div>
              <div className='col-6'>
                <Memberships
                  schema={this.projectsSchema}
                  canEdit={isUserAdmin}
                  data={projects}
                  label='Project'
                  collection='projects'
                  handleDelete={this.handleCollection}
                  handleBulkUpdates={this.handleMemberships}
                />
              </div>
            </div>
            {this.renderButton('Submit')}
          </form>
        </div>
      </React.Fragment>
    )
  }
}

export default Profile
