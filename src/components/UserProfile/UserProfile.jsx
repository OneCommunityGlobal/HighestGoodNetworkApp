import React, { useState, useEffect, useRef } from 'react'
import {
  Row,
  Input,
  Col,
  Container,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap'
import Image from 'react-bootstrap/Image'
import { Link } from 'react-router-dom'
import classnames from 'classnames'
import moment from 'moment'
import Alert from 'reactstrap/lib/Alert'

import Loading from '../common/Loading'
import UserProfileModal from './UserProfileModal'
import './UserProfile.scss'
import TeamsTab from './TeamsAndProjects/TeamsTab'
import ProjectsTab from './TeamsAndProjects/ProjectsTab'
import InfoModal from './InfoModal'
import BasicInformationTab from './BaiscInformationTab/BasicInformationTab'
import VolunteeringTimeTab from './VolunteeringTimeTab/VolunteeringTimeTab'
import SaveButton from './UserProfileEdit/SaveButton'
import UserLinkLayout from './UserLinkLayout'
import BlueSqaureLayout from './BlueSqaureLayout'
import TabToolTips from './ToolTips/TabToolTips'
import BasicToolTips from './ToolTips/BasicTabTips'
import ResetPasswordButton from '../UserManagement/ResetPasswordButton'
import PauseAndResumeButton from '../UserManagement/PauseAndResumeButton'
import Badges from './Badges'
import TimeEntryEditHistory from './TimeEntryEditHistory.jsx';

import axios from 'axios'
import { getUserProfile } from 'actions/userProfile'
import { useDispatch } from 'react-redux'

const UserProfile = props => {

  const initialHoursByCategory = {
    housing: 0,
    food: 0,
    education: 0,
    society: 0,
    energy: 0,
  }

  const initialFormValid = {
    firstName: true,
    lastName: true,
    email: true,
  }

  const [isLoading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState({
    ...props.userProfile,
    totalTangibleHrs: parseFloat(props.userProfile.totalTangibleHrs).toFixed(2),
  })
  const [id, setId] = useState('')
  const [activeTab, setActiveTab] = useState('1')
  const [infoModal, setInfoModal] = useState(false)
  const [formValid, setFormValid] = useState(initialFormValid)
  const [changed, setChanged] = useState(false)
  const [blueSquareChanged, setBlueSquareChanged] = useState(false)
  const [showSaveWarning, setShowSaveWarning] = useState(true)
  const [type, setType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [hoursByCategory, setHoursByCategory] = useState(initialHoursByCategory)
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    componentDidMount()
    calculateHoursByCategory()
  }, [])

  // The following useEffect callback is a convoluted workaround that's required given
  // how the userProfile object is stored inside the global store. Sometimes, the global userProfile object
  // doesn't match the user profile currently being viewed for some reason, meaning that when it's
  // passed down as a prop, it doesn't always match. 

  // Another factor making this necessary is that some changes to the
  // user profile object are not submitted immediately and are instead stored
  // in memory before finally being submittied. This means that the userProfile hook
  // Can't simply be replaced with props.userProfile as changes would be erased before
  // they could be submitted.

  //Because of this, we only use setUserProfile when the ID is different or when shouldRefresh is true. 
  useEffect(() => {
    if (props.userProfile._id !== userProfile._id || shouldRefresh === true) {
      setUserProfile(props.userProfile)
      setShouldRefresh(false);
    }
  }, [props.userProfile, shouldRefresh])

  useEffect(() => {
    props.getUserProfile(props.match.params.userId)
    setChanged(false);
  }, [props.match.params.userId])

  useEffect(() => {
    if (blueSquareChanged) {
      setBlueSquareChanged(false)
      handleSubmit()
    }
  }, [blueSquareChanged])

  const componentDidMount = async () => {
    if (!props.match) return

    const { userId } = props.match.params

    await props.getUserProfile(userId)
    await props.getUserTeamMembers(userId)
    await props.getAllUserTeams(userId)
    await props.fetchAllProjects(userId)
    setLoading(false)
  }

  const calculateHoursByCategory = async () => {
    try {
      const startDate = '1900-01-01'
      const endDate = '3000-01-01'
      const response = await axios.get(
        `${process.env.REACT_APP_APIENDPOINT}/TimeEntry/user/${props.match.params.userId}/${startDate}/${endDate}`,
      )
      const timeEntries = response.data

      const newHoursByCategory = { ...hoursByCategory }

      timeEntries.forEach(entry => {
        Object.keys(newHoursByCategory).forEach(category => {
          if (
            entry.isTangible &&
            entry.projectName.toLowerCase().includes(category.toLowerCase())
          ) {
            newHoursByCategory[category] += parseFloat(entry.hours)
          }
        })
      })

      setHoursByCategory(newHoursByCategory)
    } catch (err) {}
  }

  const onDeleteTeam = deletedTeamId => {
    const newUserProfile = { ...userProfile }
    const filteredTeam = newUserProfile.teams.filter(team => team._id !== deletedTeamId)
    newUserProfile.teams = filteredTeam

    setUserProfile(newUserProfile)
    setChanged(true)
  }

  const onDeleteProject = deletedProjectId => {
    const newUserProfile = { ...userProfile }
    const filteredProject = newUserProfile.projects.filter(
      project => project._id !== deletedProjectId,
    )
    newUserProfile.projects = filteredProject

    setUserProfile(newUserProfile)
    setChanged(true)
  }

  const onAssignTeam = assignedTeam => {
    const newUserProfile = { ...userProfile }
    if (newUserProfile.teams) {
      newUserProfile.teams.push(assignedTeam)
    } else {
      newUserProfile.teams = [assignedTeam]
    }

    setChanged(true)
    setUserProfile(newUserProfile)
  }

  const onAssignProject = assignedProject => {
    const newUserProfile = { ...userProfile }
    if (newUserProfile.projects) {
      newUserProfile.projects.push(assignedProject)
    } else {
      newUserProfile.projects = [assignedProject]
    }

    setUserProfile(newUserProfile)
    setChanged(true)
  }

  const handleImageUpload = async evt => {
    if (evt) evt.preventDefault()

    const file = evt.target.files[0]
    const filesizeKB = file.size / 1024

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    const allowedTypesString = `File type not permitted. Allowed types are ${allowedTypes
      .toString()
      .replaceAll(',', ', ')}`

    //Input validation: file type
    if (!allowedTypes.includes(file.type)) {
      setType('image')
      setIsValid(false)
      setShowModal(true)
      setModalTitle('Profile Pic Error')
      setModalMessage(allowedTypesString)
      return
    }

    //Input validation: file size.
    if (filesizeKB > 50) {
      const errorMessage = `The file you are trying to upload exceeds the maximum size of 50KB. You can either
														choose a different file, or use an online file compressor.`

      setType('image')
      setIsValid(false)
      setShowModal(true)
      setModalTitle('Profile Pic Error')
      setModalMessage(errorMessage)

      return
    }

    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onloadend = () => {
      setChanged(true)
      setUserProfile({ ...userProfile, profilePic: fileReader.result })
    }
  }

  const handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {

    setType(type)
    setShowModal(status)

    if (type === 'addBlueSquare') {
      setModalTitle('Blue Square')
    } else if (type === 'viewBlueSquare' || type === 'modBlueSquare') {
      setModalTitle('Blue Square')
      setId(blueSquareID)
    } else if (blueSquareID === 'none') {
      setModalTitle('Save & Refresh')
      setModalMessage('')
    }
  }

  /**
   * Modifies the userProfile's infringements using a predefined operation
   * @param {String} id Id of the blue square
   * @param {String} dateStamp
   * @param {String} summary
   * @param {String} operation 'add' | 'update' | 'delete'
   */
  const modifyBlueSquares = (id, dateStamp, summary, operation) => {

    if (operation === 'add') {
      const newBlueSquare = { date: dateStamp, description: summary }
      setShowModal(false)
      setUserProfile({
        ...userProfile,
        infringments: userProfile.infringments.concat(newBlueSquare),
      })
      setModalTitle('Blue Square')
    } else if (operation === 'update') {
      const currentBlueSquares = [...userProfile.infringments]
      if (dateStamp != null) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp
      }
      if (summary != null) {
        currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary
      }

      setShowModal(false)
      setUserProfile({ ...userProfile, infringments: currentBlueSquares })
    } else if (operation === 'delete') {
      const newInfringements = []
      userProfile.infringments.forEach(infringment => {
        if (infringment._id !== id) newInfringements.push(infringment)
      })

      setUserProfile({ ...userProfile, infringments: newInfringements })
      setShowModal(false)
    }
    setBlueSquareChanged(true)
  }

  const handleSubmit = async () => {
    const { updateUserProfile, match } = props
    try {
      await updateUserProfile(match.params.userId, userProfile)
      await getUserProfile(match.params.userId)(dispatch)
      setShowSaveWarning(false)
    } catch (err) {
      alert('An error occurred while attempting to save this profile.')
    }
    setShouldRefresh(true);
  }

  const toggleInfoModal = () => {
    setInfoModal(!infoModal)
    setShowSaveWarning(false)
  }

  const toggleTab = tab => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const updateLink = (personalLinksUpdate, adminLinksUpdate) => {
    setShowModal(false)
    setUserProfile({
      ...userProfile,
      personalLinks: personalLinksUpdate,
      adminLinks: adminLinksUpdate,
    })
  }

  const handleUserProfile = event => {
    setChanged(true)

    const emailPattern = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i)

    switch (event.target.id) {
      case 'firstName':
        setUserProfile({ ...userProfile, firstName: event.target.value.trim() })
        setFormValid({ ...formValid, firstName: !!event.target.value })
        break
      case 'lastName':
        setUserProfile({ ...userProfile, lastName: event.target.value.trim() })
        setFormValid({ ...formValid, lastName: !!event.target.value })
        break
      case 'jobTitle':
        setUserProfile({ ...userProfile, jobTitle: event.target.value })
        break
      case 'role':
        setUserProfile({ ...userProfile, role: event.target.value })
        break
      case 'email':
        setUserProfile({ ...userProfile, email: event.target.value })
        setFormValid({ ...formValid, email: emailPattern.test(event.target.value) })
        break
      case 'phoneNumber':
        setUserProfile({ ...userProfile, phoneNumber: [event.target.value.trim()] })
        break
      case 'emailPubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            email: !userProfile.privacySettings?.email,
          },
        })
        break
      case 'phonePubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            phoneNumber: !userProfile.privacySettings?.phoneNumber,
          },
        })
        break
      case 'blueSquaresPubliclyAccessible':
        setUserProfile({
          ...userProfile,
          privacySettings: {
            ...userProfile.privacySettings,
            blueSquares: !userProfile.privacySettings?.blueSquares,
          },
        })
        break
      case 'startDate':
        setUserProfile({
          ...userProfile,
          createdDate: event.target.value,
        })
        break
      case 'totalTangibleHours':
        setUserProfile({
          ...userProfile,
          totalTangibleHrs: event.target.value,
        })
        break
      case 'weeklyComittedHours':
        setUserProfile({
          ...userProfile,
          weeklyComittedHours: event.target.value,
        })
        break
      case 'collaborationPreference':
        setUserProfile({
          ...userProfile,
          collaborationPreference: event.target.value,
        })
        break
      case 'weeklySummaryNotReqd':
        setUserProfile({
          ...userProfile,
          weeklySummaryNotReq: !userProfile.weeklySummaryNotReq
        });
    }
  }

  if (isLoading && !props.isAddNewUser) {
    return (
      <Container fluid>
        <Row className="text-center" data-test="loading">
          <Loading />
        </Row>
      </Container>
    )
  }

  const { firstName, lastName, profilePic, jobTitle = '' } = userProfile

  const { userId: targetUserId } = props.match ? props.match.params : { userId: undefined }
  const { userid: requestorId, role: requestorRole } = props.auth.user

  const isUserSelf = targetUserId === requestorId
  const isUserAdmin = requestorRole === 'Administrator'
  const canEdit = isUserAdmin || isUserSelf

  return (
    <div>
      {showModal && (
        <UserProfileModal
          isOpen={showModal}
          closeModal={() => setShowModal(false)}
          modalMessage={modalMessage}
          modalTitle={modalTitle}
          type={type}
          updateLink={updateLink}
          modifyBlueSquares={modifyBlueSquares}
          userProfile={userProfile}
          id={id}
          isUserAdmin={isUserAdmin}
          handleLinkModel={props.handleLinkModel}
        />
      )}
      <TabToolTips />
      <BasicToolTips />
      <InfoModal isOpen={infoModal} toggle={toggleInfoModal} />
      <Container className="emp-profile">
        <Row>
          <Col md="4" id="profileContainer">
            <div className="profile-img">
              <Image
                src={profilePic || '/defaultprofilepic.png'}
                alt="Profile Picture"
                roundedCircle
                className="profilePicture"
              />
              {canEdit ? (
                <div className="file btn btn-lg btn-primary">
                  Change Photo
                  <Input
                  style={{width: '100%', height: '100%', zIndex: '2'}}
                    type="file"
                    name="newProfilePic"
                    id="newProfilePic"
                    onChange={handleImageUpload}
                    accept="image/png,image/jpeg, image/jpg"

                  />
                </div>
              ) : null}
            </div>
          </Col>
          <Col md="8">
            <div className="profile-head">
              {changed && showSaveWarning && (
                <Alert color="warning">
                  Please click on "Save changes" to save the changes you have made.{' '}
                </Alert>
              )}
              <h5 style={{ display: 'inline-block', marginRight: 10 }}>
                {`${firstName} ${lastName}`}
              </h5>
              <i
                data-toggle="tooltip"
                data-placement="right"
                title="Click for more information"
                style={{ fontSize: 24, cursor: 'pointer' }}
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={toggleInfoModal}
              />{' '}
              {isUserAdmin && (
                <i
                  data-toggle="tooltip"
                  class="fa fa-clock-o"
                  aria-hidden="true"
                  style={{ fontSize: 24, cursor: 'pointer' }}
                  title="Click to see user's timelog"
                  onClick={() => props.history.push(`/timelog/${targetUserId}`)}
                />
              )}
              <h6>{jobTitle}</h6>
              <p className="proile-rating">
                From : <span>{moment(userProfile.createdDate).format('YYYY-MM-DD')}</span>
                {'   '}
                To: <span>N/A</span>
              </p>
            </div>
            <Badges
              userId={userProfile._id}
              isAdmin={isUserAdmin}
              badges={props.userProfile.badgeCollection}
            />
          </Col>
        </Row>
        <Row>
          <Col md="4">
            <div className="profile-work">
              <UserLinkLayout
                isUserAdmin={isUserAdmin}
                isUserSelf={isUserSelf}
                userProfile={userProfile}
                updateLink={updateLink}
                handleLinkModel={props.handleLinkModel}
              />
              <BlueSqaureLayout
                userProfile={userProfile}
                handleUserProfile={handleUserProfile}
                handleSaveError={props.handleSaveError}
                handleBlueSquare={handleBlueSquare}
                isUserAdmin={isUserAdmin}
                isUserSelf={isUserSelf}
              />
            </div>
          </Col>
          <Col md="8">
            <div className="profile-tabs">
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '1' }, 'nav-link')}
                    onClick={() => toggleTab('1')}
                    id="nabLink-basic"
                  >
                    Basic Information
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '2' }, 'nav-link')}
                    onClick={() => toggleTab('2')}
                    id="nabLink-time"
                  >
                    Volunteering Times
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '3' }, 'nav-link')}
                    onClick={() => toggleTab('3')}
                    id="nabLink-teams"
                  >
                    Teams
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '4' }, 'nav-link')}
                    onClick={() => toggleTab('4')}
                    id="nabLink-projects"
                  >
                    Projects
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === '5' }, 'nav-link')}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTab('5')
                    }}
                    data-testid="edit-history-tab"
                  >
                    Edit History
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
            <TabContent
              activeTab={activeTab}
              className="tab-content profile-tab"
              id="myTabContent"
              style={{ border: 0 }}
            >
              <TabPane tabId="1">
                <BasicInformationTab
                  userProfile={userProfile}
                  isUserAdmin={isUserAdmin}
                  isUserSelf={isUserSelf}
                  handleUserProfile={handleUserProfile}
                  formValid={formValid}
                />
              </TabPane>
              <TabPane tabId="2">
                <VolunteeringTimeTab
                  userProfile={userProfile}
                  isUserAdmin={isUserAdmin}
                  isUserSelf={isUserSelf}
                  handleUserProfile={handleUserProfile}
                  timeEntries={props.timeEntries}
                  hoursByCategory={hoursByCategory}
                />
              </TabPane>
              <TabPane tabId="3">
                <TeamsTab
                  userTeams={userProfile?.teams || []}
                  teamsData={props?.allTeams?.allTeamsData || []}
                  onAssignTeam={onAssignTeam}
                  onDeleteteam={onDeleteTeam}
                  isUserAdmin={isUserAdmin}
                  edit={isUserAdmin}
                />
              </TabPane>
              <TabPane tabId="4">
                <ProjectsTab
                  userProjects={userProfile.projects || []}
                  projectsData={props?.allProjects?.projects || []}
                  onAssignProject={onAssignProject}
                  onDeleteProject={onDeleteProject}
                  isUserAdmin={isUserAdmin}
                  edit={isUserAdmin}
                />
              </TabPane>
              <TabPane tabId="5">
                <TimeEntryEditHistory
                userProfile={userProfile}
                isAdmin={isUserAdmin}
                updateUserProfile={props.updateUserProfile}
                getUserProfile={props.getUserProfile}
                setUserProfile={setUserProfile}
                />
              </TabPane>
            </TabContent>
          </Col>
        </Row>
        <Row>
          <Col md="4"></Col>
          <Col md="8">
            {requestorRole === 'Administrator' && canEdit && !isUserSelf && (
              <ResetPasswordButton className="mr-1" user={userProfile} />
            )}
            {isUserSelf && (
              <div className="profileEditButtonContainer">
                <Link to={`/updatepassword/${userProfile._id}`}>
                  <Button className="mr-1" color="primary">
                    {' '}
                    Update Password
                  </Button>
                </Link>
              </div>
            )}
            <PauseAndResumeButton className="mr-1" user={userProfile} isBigBtn={true} />
            <Link
              color="primary"
              to={`/userprofile/${userProfile._id}`}
              className="btn btn-outline-danger mr-1"
            >
              Cancel
            </Link>
            <SaveButton
              className="mr-1"
              handleSubmit={handleSubmit}
              disabled={!formValid.firstName || !formValid.lastName || !formValid.email || !changed}
              userProfile={userProfile}
            />
          </Col>
        </Row>
      </Container>
      {/* </Row>
          </Col>

        </div>

        <div >

          <UserTeamProjectContainer
            userTeams={this.state ? this.state.userProfile.teams : []}
            userProjects={this.state ? this.state.userProfile.projects : []}
            teamsData={props ? props.allTeams.allTeamsData : []}
            projectsData={props ? props.allProjects.projects : []}
            onAssignTeam={this.onAssignTeam}
            onAssignProject={this.onAssignProject}
            onDeleteteam={this.onDeleteTeam}
            onDeleteProject={this.onDeleteProject}
            isUserAdmin={isUserAdmin} />

        </div> */}
    </div>
  )
}

export default UserProfile
