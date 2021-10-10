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

import ToggleSwitch from '../UserProfileEdit/ToggleSwitch'
import './UserProfileAdd.scss'
import { createUser, resetPassword } from '../../../services/userProfileService'
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
import TimeZoneDropDown from '../TimeZoneDropDown'

class AddUserProfile extends Component {
  constructor(props) {
    super(props)
    const initalUserProject = props.allProjects.projects.filter((project) => {
      if (project.projectName === 'Orientation and Initial Setup'){
        return project;
      }
    });
    this.state = {
      weeklyComittedHours: 10,
      teams: [],
      projects: [...initalUserProject],
      activeTab: '1',
      userProfile: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: null,
        weeklyComittedHours: 10,
        role: 'Volunteer',
        privacySettings: { blueSquares: true, email: true, phoneNumber: true },
        jobTitle: '',
        googleDoc: '',
      },
      formValid: {},
      formErrors: {},
      timeZoneFilter: '',
    }
  }

  render() {
    const { firstName, email, lastName, phoneNumber, role, jobTitle } = this.state.userProfile;
    return (
      <StickyContainer>
        <Container className="emp-profile">
          <Row>
            <Col md="12">
              <Form>
                <Row>
                  <Col md={{size: 2, offset:2}} className="text-md-right my-2">
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
                        invalid={this.state.formValid.firstName === undefined ? false : !this.state.formValid.firstName}
                      />
                      <FormFeedback>{this.state.formErrors.firstName}</FormFeedback>
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
                        invalid={this.state.formValid.lastName === undefined ? false : !this.state.formValid.lastName}
                      />
                      <FormFeedback>{this.state.formErrors.lastName}</FormFeedback>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col  md={{size: 3, offset:1}} className="text-md-right my-2">
                    <Label>Job Title</Label>
                  </Col>
                  <Col  md={{size: 6}}>
                    <FormGroup>
                      <Input
                        type="text"
                        name="jobTitle"
                        id="jobTitle"
                        value={jobTitle}
                        onChange={this.handleUserProfile}
                        placeholder="Job Title"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={{size: 2, offset:2}} className="text-md-right my-2">
                    <Label>Email</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>

                      <Input
                        type="email"
                        name="email"
                        id="email"
                        value={email}
                        onChange={this.handleUserProfile}
                        placeholder="Email"
                        invalid={this.state.formValid.email === undefined ? false : !this.state.formValid.email}
                      />
                      <FormFeedback>{this.state.formErrors.email}</FormFeedback>

                      <ToggleSwitch
                        switchType="email"
                        state={this.state.userProfile.privacySettings?.email}
                        handleUserProfile={this.handleUserProfile}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={{size: 2, offset:2}} className="text-md-right my-2">
                    <Label>Phone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <PhoneInput
                        country={'us'}
                        value={phoneNumber}
                        onChange={phone => this.phoneChange(phone)}
                      />
                      <p style={{color: 'red', paddingTop:'0.3rem'}}>{this.state.formErrors.phoneNumber}</p>
                      <ToggleSwitch
                        switchType="phone"
                        state={this.state.userProfile.privacySettings?.phoneNumber}
                        handleUserProfile={this.handleUserProfile}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={{size: 4}} className="text-md-right my-2">
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
                  <Col md={{size: 2, offset:2}} className="text-md-right my-2">
                    <Label>Role</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Input
                        type="select"
                        name="role"
                        id="role"
                        defaultValue='Volunteer'
                        onChange={this.handleUserProfile}
                        >
                        <option value="Administrator">Administrator</option>
                        <option value="Volunteer">
                          Volunteer
                        </option>
                        <option value="Manager">Manager</option>
                        <option value="Core Team">Core Team</option>
                      {/* </select> */}
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={{size: 4}} className="text-md-right my-2">
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
                  <Col md={{size: 3, offset:1}} className="text-md-right my-2">
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
                <Row>
                  <Col md={{size: 3, offset:1}} className="text-md-right my-2">
                    <Label>Time Zone</Label>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <TimeZoneDropDown
                      filter={this.state.timeZoneFilter}
                      onChange={this.handleUserProfile}
                      selected={'America/Los_Angeles'}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col md={{size: 4, offset:0}} className="text-md-right my-2">
                    <Label>Search For Time Zone</Label>
                  </Col>
                  <Col md="6">
                    <Input
                      onChange={(e) => this.setState({...this.state, timeZoneFilter: e.target.value})}
                    />
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
                      Project
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={classnames({ active: this.state.activeTab === '2' }, 'nav-link')}
                      onClick={() => {
                        this.toggleTab('2')
                      }}
                    >
                      Team
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
                  <ProjectsTab
                    userProjects={this.state.projects}
                    projectsData={this.props ? this.props.allProjects.projects : []}
                    onAssignProject={this.onAssignProject}
                    onDeleteProject={this.onDeleteProject}
                    isUserAdmin={true}
                    edit
                  />
                </TabPane>
                <TabPane tabId="2">
                  <TeamsTab
                    userTeams={this.state.teams}
                    teamsData={this.props ? this.props.allTeams.allTeamsData : []}
                    onAssignTeam={this.onAssignTeam}
                    onDeleteteam={this.onDeleteTeam}
                    isUserAdmin={true}
                    edit
                  />
                </TabPane>
              </TabContent>
            </Col>
          </Row>
          <Row>
            {/* <Col></Col> */}
            <Col md="12">
              <div className="w-50 pt-4 mx-auto">
              <Button color="primary" block size="lg" onClick={this.createUserProfile}>
                Create
              </Button>
              </div>
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
      timeZone
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
      timeZone
    }

    if (googleDoc) {
      userData.adminLinks.push({ Name: 'Google Doc', Link: googleDoc })
    }

    createUser(userData)
      .then(res => {
        if(res.data.warning){
          toast.warn(res.data.warning);
        }
        else {
          toast.success('User profile created.')
        }
        this.props.userCreated()
      })
      .catch(err => {
        if(err.response?.data?.type){
          switch (err.response.data.type) {
            case 'email':
              this.setState({
                formValid: {
                  ...that.state.formValid,
                  email: false,
                },
                formErrors: {
                  ...that.state.formErrors,
                  email: 'Email already exists'
                },
              });
              break;
            case 'phoneNumber':
              this.setState({
                formValid: {
                  ...that.state.formValid,
                  phoneNumber: false,
                },
                formErrors: {
                  ...that.state.formErrors,
                  phoneNumber: 'Phone number already exists'
                },
              });
              break;
          }
        }
        toast.error(
          err.response?.data?.error ||
            'An unknown error occurred while attempting to create this user.',
        )
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
    const { userProfile, formValid, formErrors } = this.state
    this.setState({
      userProfile: {
        ...userProfile,
        phoneNumber: phone,
      },
      formValid: {
        ...formValid,
        phoneNumber: phone.length>10,
      },
      formErrors: {
        ...formErrors,
        phoneNumber: phone.length>10? '' : 'Please enter valid phone number', 
      }
    })
  }

  handleUserProfile = event => {
    this.setState({
      showWarning: true,
    })
    const { userProfile, formValid, formErrors } = this.state
    const patt = new RegExp(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i)
    
    switch (event.target.id) {
      case 'firstName':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.length > 0,
          },
          formErrors: {
            ...formErrors,
            firstName: event.target.value.length > 0? '' : 'First name can not be empty',
          },
        });
        break;
      case 'lastName':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.length > 0,
          },
          formErrors: {
            ...formErrors,
            lastName: event.target.value.length > 0? '' : 'Last name can not be empty',
          },
        });
        break;
      case 'email':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: event.target.value.match(patt),
          },
          formErrors: {
            ...formErrors,
            email: event.target.value.match(patt)? '' : 'Email is not valid',
          }
        });
        break;
      case 'timeZone':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'jobTitle':
        this.setState({
          ...this.state,
          userProfile: {
            ...this.state.userProfile,
            jobTitle: event.target.value,
          },
        });
        break;
      case 'weeklyComittedHours':
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
      case 'collaborationPreference':
        this.setState({
          userProfile: {
            ...userProfile,
            [event.target.id]: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            [event.target.id]: !!event.target.value,
          },
        });
        break;
      case 'role':
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
