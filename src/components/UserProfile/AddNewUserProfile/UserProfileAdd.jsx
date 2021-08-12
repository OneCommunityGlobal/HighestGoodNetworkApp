import React, { Component } from 'react'
import { StickyContainer } from 'react-sticky'
import {
  Container,
  Row,
  Col,
  Input,
  FormFeedback,
  FormGroup,
  Form,
  Label,
  Button,
  TabPane,
  TabContent,
  NavItem,
  NavLink,
  Nav,
} from 'reactstrap'
// import Image from 'react-bootstrap/Image';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch'
import './UserProfileAdd.scss'
import { createUser } from '../../../services/userProfileService'
import { toast } from 'react-toastify'
import TeamsTab from '../TeamsAndProjects/TeamsTab'
import ProjectsTab from '../TeamsAndProjects/ProjectsTab'
import { connect } from 'react-redux'
import _ from 'lodash'
import { getUserProfile, updateUserProfile, clearUserProfile } from '../../../actions/userProfile'
import {
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
} from '../../../actions/allTeamsAction'

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import classnames from 'classnames'

class AddUserProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      weeklyComittedHours: 10,
      teams: [],
      projects: [],
      activeTab: '1',
      userProfile: {
        weeklyComittedHours: 10,
        role: 'Volunteer',
        privacySettings: { blueSquares: true, email: true, phoneNumber: true },
        jobTitle: '',
      },
      formValid: {},
    }
  }

  render() {
    const { firstName, email, lastName, phoneNumber, role, jobTitle } = this.state
    return (
      <StickyContainer>
        <Container className="emp-profile">
          <Row>
            <Col md="12">
              <Form>
                <Row>
                  <Col md="6">
                    <Label>Name</Label>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={firstName}
                        onChange={this.handleUserProfile}
                        placeholder="First Name"
                        invalid={!this.state.formValid.firstName}
                      />
                      <FormFeedback>First Name Can't be empty.</FormFeedback>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={lastName}
                        onChange={this.handleUserProfile}
                        placeholder="Last Name"
                        invalid={!this.state.formValid.lastName}
                      />
                      <FormFeedback>Last Name Can't be empty.</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <Label>Job Title</Label>
                  </Col>
                  <Col>
                    <FormGroup>
                      <Input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={this.handleUserProfile}
                        placeholder="Job Title"
                      />
                      <FormFeedback>First Name Can't be empty.</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Email</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <ToggleSwitch
                        switchType="email"
                        state={this.state.userProfile.privacySettings?.email}
                        handleUserProfile={this.handleUserProfile}
                      />

                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={this.handleUserProfile}
                        placeholder="Email"
                        invalid={!this.state.formValid.email}
                      />
                      <FormFeedback>Email is not Valid</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Phone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <ToggleSwitch
                        switchType="phone"
                        state={this.state.userProfile.privacySettings?.phoneNumber}
                        handleUserProfile={this.handleUserProfile}
                      />
                      <PhoneInput
                        country={'us'}
                        value={phoneNumber}
                        onChange={phone => this.phoneChange(phone)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Weekly Comitted Hours</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="number"
                        name="weeklyComittedHours"
                        id="weeklyComittedHours"
                        value={this.state.userProfile.weeklyComittedHours}
                        onChange={this.handleUserProfile}
                        placeholder="Weekly Comitted Hours"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Role</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <select
                        value={role}
                        onChange={this.handleUserProfile}
                        id="role"
                        name="role"
                        className="form-control"
                      >
                        <option value="Administrator">Administrator</option>
                        <option selected value="Volunteer">
                          Volunteer
                        </option>
                        <option value="Manager">Manager</option>
                        <option value="Core Team">Core Team</option>
                      </select>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Video Call Preference</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="collaborationPreference"
                        id="collaborationPreference"
                        value={this.state.userProfile.collaborationPreference}
                        onChange={this.handleUserProfile}
                        placeholder="Skype, Zoom, etc."
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md="6">
                    <Label>Google Doc</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="text"
                        name="googleDoc"
                        id="googleDoc"
                        value={this.state.userProfile.googleDoc}
                        onChange={this.handleUserProfile}
                        placeholder="Admin Document"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <div className="profile-tabs">
                <Nav tabs>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === '1' }, 'nav-link')}
                      onClick={() => {
                        this.toggleTab('1')
                      }}
                    >
                      Team
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === '2' }, 'nav-link')}
                      onClick={() => {
                        this.toggleTab('2')
                      }}
                    >
                      Project
                    </NavLink>
                  </NavItem>
                </Nav>
              </div>
              <TabContent
                activeTab={this.state.activeTab}
                className="tab-content profile-tab"
                id="myTabContent"
                style={{ border: 0 }}
              >
                <TabPane tabId="1">
                  <TeamsTab
                    userTeams={this.state.teams}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onDeleteteam={this.onDeleteTeam}
                    isUserAdmin={true}
                    edit
                  />
                </TabPane>
                <TabPane tabId="2">
                  <ProjectsTab
                    userProjects={this.state.projects}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={true}
                    edit
                  />
                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Row>
            <Col></Col>
            <Col>
              <Button color="primary" onClick={this.createUserProfile}>
                Create
              </Button>
            </Col>
          </Row>
        </Container>
      </StickyContainer>
    )
  }

  onDeleteTeam = deletedTeamId => {
    const teams = [...this.state.teams]
    const filteredTeam = teams.filter(team => team._id !== deletedTeamId)

    this.setState({
      teams: filteredTeam,
    })
  }

  onDeleteProject = deletedProjectId => {
    const projects = [...this.state.projects]
    const _projects = projects.filter(project => project._id !== deletedProjectId)
    this.setState({
      projects: _projects,
    })
  }

  onAssignTeam = assignedTeam => {
    const teams = [...this.state.teams]
    teams.push(assignedTeam)

    this.setState({
      teams: teams,
    })
  }

  onAssignProject = assignedProject => {
    const projects = [...this.state.projects]
    projects.push(assignedProject)

    this.setState({
      projects: projects,
    })
  }

  createUserProfile = () => {
    let that = this
    const {
      firstName,
      email,
      lastName,
      phoneNumber,
      role,
      privacySettings,
      collaborationPreference,
      googleDoc,
      jobTitle,
    } = that.state.userProfile

    const userData = {
      password: '123Welcome!',
      role: role,
      firstName: firstName,
      lastName: lastName,
      jobTitle: jobTitle,
      phoneNumber: phoneNumber,
      bio: '',
      weeklyComittedHours: that.state.userProfile.weeklyComittedHours,
      personalLinks: [],
      adminLinks: [],
      teams: this.state.teams,
      projects: this.state.projects,
      email: email,
      privacySettings: privacySettings,
      collaborationPreference: collaborationPreference,
    }

    if (googleDoc) {
      userData.adminLinks.push({ Name: 'Google Doc', Link: googleDoc })
    }

    createUser(userData)
      .then(res => {
        toast.success('User profile created.')
        this.props.userCreated()
      })
      .catch(err => {
        toast.error(err.response.data.message)
      })
  }

  handleImageUpload = async e => {
    e.preventDefault()

    const file = e.target.files[0]

    const allowedTypesString = 'image/png,image/jpeg, image/jpg'
    const allowedTypes = allowedTypesString.split(',')
    let isValid = true
    let imageUploadError = ''
    if (!allowedTypes.includes(file.type)) {
      imageUploadError = `File type must be ${allowedTypesString}.`
      isValid = false

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      })
    }
    const filesizeKB = file.size / 1024
    // console.log(filesizeKB);

    if (filesizeKB > 50) {
      imageUploadError = `\n The file you are trying to upload exceeds the maximum size of 50KB. You can either
														choose a different file, or use an online file compressor.`
      isValid = false

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      })
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      // console.log(reader, file);

      this.setState({
        imageUploadError: '',
        userProfile: {
          ...this.state.userProfile,
          profilePic: reader.result,
        },
      })
    }
  }

  toggleTab = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  phoneChange = phone => {
    const { userProfile } = this.state
    this.setState({
      userProfile: {
        ...userProfile,
        phoneNumber: phone,
      },
    })
  }

  handleUserProfile = event => {
    this.setState({
      showWarning: true,
    })
    const { userProfile, formValid } = this.state
    const patt = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i)
    switch (event.target.id) {
      case 'firstName':
      case 'lastName':
      case 'email':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        })
        break
      case 'jobTitle':
        this.setState({
          ...this.state,
          userProfile: {
            ...this.state.userProfile,
            jobTitle: event.target.value,
          },
        })
      case 'phoneNumber':
      case 'weeklyComittedHours':
      case 'collaborationPreference':
      case 'role':
      case 'googleDoc':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value,
          },
        })
        break
      case 'emailPubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              email: !userProfile.privacySettings?.email,
            },
          },
        })
        break
      case 'phonePubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              phoneNumber: !userProfile.privacySettings?.phoneNumber,
            },
          },
        })
        break
      default:
        this.setState({
          ...userProfile,
        })
    }
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  userProjects: state.userProjects,
  allProjects: _.get(state, 'allProjects'),
  allTeams: state,
  state,
})

export default connect(mapStateToProps, {
  getUserProfile,
  clearUserProfile,
  updateUserProfile,
  getAllUserTeams,
  updateTeam,
  deleteTeamMember,
  addTeamMember,
})(AddUserProfile)
