import React, { Component } from 'react'
import Loading from '../../common/Loading'
import { Row, Label, Input, CardTitle, Col, Container, Button, Badge, Collapse } from 'reactstrap'

import Image from 'react-bootstrap/Image'
import { orange, warningRed } from '../../../constants/colors'
import BlueSquare from '../BlueSquares'
import Modal from '../UserProfileModal'
import UserLinks from '../UserLinks'
import ToggleSwitch from './ToggleSwitch'
import { Link } from 'react-router-dom'

import styleProfile from '../UserProfile.module.scss'
import styleEdit from './UserProfileEdit.module.scss'

class EditProfile extends Component {
  state = {
    isLoading: true,
    error: '',
    userProfile: {},
    firstNameError: '',
    lastNameError: '',
    imageUploadError: '',
    isValid: false,
    id: '',
    privacySettings: {
      email: true,
      phoneNumber: true,
      blueSquares: true,
    },
  }

  async componentDidMount() {
    // this.props.getCurrentUser(getjwt())
    if (this.props.match) {
      let userId = this.props.match.params.userId
      await this.props.getUserProfile(userId)
      await this.props.getUserTeamMembers(userId)
      if (this.props.userProfile.firstName.length) {
        // check props:
        // console.log('props:', this.props.userProfile)
        // fill in defaults where needed
        this.setState({ isLoading: false, userProfile: this.props.userProfile })

        if (this.props.userProfile.privacySettings) {
          this.setState({
            isLoading: false,
            userProfile: {
              ...this.props.userProfile,
            },
          })
        }
      }
    }
  }

  handleUserProfile = event => {
    if (event.target.id === 'firstName') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          firstName: event.target.value.trim(),
        },
        showModal: event.target.value ? false : true,
        modalTitle: 'First Name Error',
        modalMessage: 'First Name cannot be empty',
      })
    }

    if (event.target.id === 'lastName') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          lastName: event.target.value.trim(),
        },
        showModal: event.target.value ? false : true,
        modalTitle: 'First Name Error',
        modalMessage: 'Last Name cannot be empty',
      })
    }

    if (event.target.id === 'jobTitle') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          jobTitle: event.target.value,
        },
      })
    }

    if (event.target.id === 'email') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          email: event.target.value.trim(),
        },
        emailError: event.target.value ? '' : 'Email cannot be empty ',
      })
    }

    if (event.target.id === 'phoneNumber') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          phoneNumber: event.target.value.trim(),
        },
      })
    }

    if (event.target.id === 'emailPubliclyAccessible') {
      //   console.log(this.state)

      this.setState({
        userProfile: {
          ...this.state.userProfile,
          privacySettings: {
            ...this.state.userProfile.privacySettings,
            email: !this.state.userProfile.privacySettings?.email,
          },
        },
      })
    }

    if (event.target.id === 'phonePubliclyAccessible') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          privacySettings: {
            ...this.state.userProfile.privacySettings,
            phoneNumber: !this.state.userProfile.privacySettings?.phoneNumber,
          },
        },
      })
    }

    if (event.target.id === 'blueSquaresPubliclyAccessible') {
      this.setState({
        userProfile: {
          ...this.state.userProfile,
          privacySettings: {
            ...this.state.userProfile.privacySettings,
            blueSquares: !this.state.userProfile.privacySettings?.blueSquares,
          },
        },
      })
    }

    var elem = document.getElementById('warningCard')
    elem.style.display = 'block'
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
    let filesizeKB = file.size / 1024
    console.log(filesizeKB)

    if (filesizeKB > 50) {
      imageUploadError = `\nThe file you are trying to upload exceeds the maximum size of 50KB. You can either 
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

    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      console.log(reader, file)

      this.setState({
        imageUploadError: '',
        userProfile: {
          ...this.state.userProfile,
          profilePic: reader.result,
        },
      })
    }
  }

  handleNullState = kind => {
    console.log('before handle def:', this.state.userProfile)

    switch (kind) {
      case 'settings':
        this.setState(() => {
          return {
            showModal: false,
            userProfile: {
              ...this.state.userProfile,
              privacySettings: {
                email: true,
                phoneNumber: true,
                blueSquares: true,
              },
            },
          }
        })
        break
      default:
        break
    }
  }

  handleBlueSquare = (status = true, type = 'message', blueSquareID = '') => {
    if (type === 'addBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type: type,
      })
    } else if (type === 'modBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type: type,
        id: blueSquareID,
      })
    } else if (type === 'viewBlueSquare') {
      this.setState({
        showModal: status,
        modalTitle: 'Blue Square',
        type: type,
        id: blueSquareID,
      })
    } else if (blueSquareID === 'none') {
      this.setState({
        showModal: status,
        modalTitle: 'Save & Refresh',
        modalMessage: '',
        type: type,
      })
    }
  }

  updateBlueSquare = (id, dateStamp, summary, kind) => {
    // console.log('Handle Blue Square: ', kind, ' date:', dateStamp, ' summary:', summary)
    var elem = document.getElementById('warningCard')
    elem.style.display = 'block'

    if (kind === 'add') {
      let newBlueSquare = { date: dateStamp, description: summary }
      this.setState(prevState => {
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringments: prevState.userProfile.infringments.concat(newBlueSquare),
          },
        }
      })
    } else if (kind === 'update') {
      this.setState(() => {
        let currentBlueSquares = this.state.userProfile.infringments
        if (dateStamp != null) {
          currentBlueSquares.find(blueSquare => blueSquare._id === id).date = dateStamp
        }
        if (summary != null) {
          currentBlueSquares.find(blueSquare => blueSquare._id === id).description = summary
        }
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringments: currentBlueSquares,
          },
        }
      })
    } else if (kind === 'delete') {
      this.setState(() => {
        var currentBlueSquares = this.state.userProfile.infringments.filter(function(blueSquare) {
          if (blueSquare._id !== id) {
            return blueSquare
          }
        })
        return {
          showModal: false,
          userProfile: {
            ...this.state.userProfile,
            infringments: currentBlueSquares,
          },
        }
      })
    }
  }

  handleSaveError = message => {
    this.setState({
      showModal: true,
      modalMessage: 'Must save first.',
      modalTitle: 'Error, ' + message,
      type: 'message',
    })
  }

  handleSubmit = async event => {
    event.preventDefault()

    const submitResult = await this.props.updateUserProfile(
      this.props.match.params.userId,
      this.state.userProfile,
    )
    // console.log(submitResult)

    if (submitResult === 200) {
      this.setState({
        showModal: true,
        modalMessage: 'Your Changes were saved successfully',
        modalTitle: 'Success',
        type: 'save',
      })
      var elem = document.getElementById('warningCard')
      elem.style.display = 'none'
    } else {
      this.setState({
        showModal: true,
        modalMessage: 'Please try again.',
        modalTitle: 'Error',
        type: 'save',
      })
    }
  }

  updateLink = (personalLinksUpdate, adminLinksUpdate) => {
    var elem = document.getElementById('warningCard')
    elem.style.display = 'block'

    return this.setState(() => {
      return {
        showModal: false,
        userProfile: {
          ...this.state.userProfile,
          personalLinks: personalLinksUpdate,
          adminLinks: adminLinksUpdate,
        },
      }
    })
  }

  handleLinkModel = (status = true, type = 'message', linkSection) => {
    if (type === 'addLink') {
      this.setState({
        showModal: status,
        modalTitle: 'Add a New Link',
        linkType: linkSection,
        type: type,
      })
    } else if (type === 'updateLink') {
      this.setState({
        showModal: status,
        modalTitle: 'Edit Links',
        linkType: linkSection,
        type: type,
      })
    }
  }

  modLinkButton = (canEditFields, isUserAdmin) => {
    if (canEditFields) {
      let user = 'user'
      if (isUserAdmin) {
        user = 'admin'
      }
      return (
        <button
          className={styleEdit.modLinkButton}
          data-testid="edit-link"
          onClick={() => {
            this.handleLinkModel(true, 'updateLink', user)
          }}
        >
          <i className="fa fa-wrench fa-lg" aria-hidden="true">
            {' '}
          </i>
        </button>
      )
    }
  }

  render() {
    let { userId: targetUserId } = this.props.match
      ? this.props.match.params
      : { userId: undefined }
    let { userid: requestorId, role: requestorRole } = this.props.auth.user

    const { userProfile, isLoading, showModal } = this.state
    const {
      firstName,
      lastName,
      email,
      profilePic,
      phoneNumber,
      jobTitle = '',
      personalLinks,
      adminLinks,
      infringments,
      privacySettings,
    } = userProfile

    let isUserSelf = targetUserId === requestorId
    const isUserAdmin = requestorRole === 'Administrator'
    let canEditFields = isUserAdmin || isUserSelf

    if (isLoading === true) {
      return (
        <Container fluid>
          <Row className="text-center" data-test="loading">
            <Loading />
          </Row>
        </Container>
      )
    }

    if (!canEditFields) {
      return (
        <Col>
          <Row className={styleProfile.profileContainer}>
            <Label>Sorry, you do not have permison to edit this profile.</Label>
          </Row>
        </Col>
      )
    }

    return (
      <div>
        <CardTitle id="warningCard" className={styleEdit.saveChangesWarning}>
          Reminder: You must click "Save Changes" at the bottom of this page. If you don't, changes
          to your profile will not be saved.
        </CardTitle>

        {showModal && (
          <Modal
            isOpen={this.state.showModal}
            closeModal={() => {
              this.setState({ showModal: false })
            }}
            modalMessage={this.state.modalMessage}
            modalTitle={this.state.modalTitle}
            type={this.state.type}
            updateLink={this.updateLink}
            updateBlueSquare={this.updateBlueSquare}
            linkType={this.state.linkType}
            userProfile={this.state.userProfile}
            id={this.state.id}
            isUserAdmin={isUserAdmin}
            handleLinkModel={this.handleLinkModel}
          />
        )}

        <Col>
          <Row className={styleProfile.profileContainer}>
            <div className={styleProfile.whoSection}>
              <Label
                for="newProfilePic"
                htmlFor={'newProfilePic'}
                className={styleEdit.profileEditTitleCenter}
              >
                Change Profile Picture
              </Label>
              <Input
                type="file"
                name="newProfilePic"
                id={'newProfilePic'}
                style={{ visibility: 'hidden', width: 0, height: 0 }}
                onChange={this.handleImageUpload}
                accept={'image/png,image/jpeg, image/jpg'}
              />
              <div>
                <Image
                  src={profilePic || '/defaultprofilepic.png'}
                  alt="Profile Picture"
                  roundedCircle
                  className="profilePicture"
                />
              </div>
              <div className={styleEdit.inputSections}>
                <Label className={styleEdit.profileEditTitle}>Name:</Label>
                <Input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={firstName}
                  className={styleProfile.profileText}
                  onChange={this.handleUserProfile}
                  placeholder="First Name"
                />
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={lastName}
                  className={styleProfile.profileText}
                  onChange={this.handleUserProfile}
                  placeholder="Last Name"
                />
                <Label className={styleEdit.profileEditTitle}>Title:</Label>
                <Input
                  type="title"
                  name="jobTitle"
                  id="jobTitle"
                  value={jobTitle}
                  className={styleProfile.profileText}
                  onChange={this.handleUserProfile}
                  placeholder="Job Title"
                />

                <ToggleSwitch
                  switchType="bluesquares"
                  state={privacySettings?.blueSquares}
                  handleUserProfile={this.handleUserProfile}
                />

                <BlueSquare
                  isUserAdmin={isUserAdmin}
                  blueSquares={infringments}
                  handleBlueSquare={this.handleBlueSquare}
                  handleSaveError={this.handleSaveError}
                />
                <br />
              </div>
            </div>

            <div className={styleEdit.detailEditSection}>
              <div className={styleEdit.inputSections}>
                <ToggleSwitch
                  switchType="email"
                  state={userProfile.privacySettings?.email}
                  handleUserProfile={this.handleUserProfile}
                />

                <Input
                  type="email"
                  name="email"
                  id="email"
                  className={styleProfile.profileText}
                  value={email}
                  onChange={this.handleUserProfile}
                  placeholder="Email"
                />

                <ToggleSwitch
                  switchType="phone"
                  state={userProfile.privacySettings?.phoneNumber}
                  handleUserProfile={this.handleUserProfile}
                />

                <Input
                  type="number"
                  name="phoneNumber"
                  id="phoneNumber"
                  className={styleProfile.profileText}
                  value={phoneNumber}
                  onChange={this.handleUserProfile}
                  placeholder="Phone"
                />

                <div>
                  <div className={styleProfile.linkIconSection}>
                    <div className={styleProfile.icon}>
                      <i className="fa fa-link" aria-hidden="true"></i>
                    </div>
                  </div>

                  <div className={styleProfile.profileLinks}>
                    {this.modLinkButton(canEditFields, isUserAdmin)}
                    <UserLinks
                      linkSection="admin"
                      links={adminLinks}
                      handleLinkModel={this.handleLinkModel}
                      isUserAdmin={isUserAdmin}
                    />
                  </div>

                  <div className={styleProfile.profileLinks}>
                    <UserLinks
                      linkSection="user"
                      links={personalLinks}
                      handleLinkModel={this.handleLinkModel}
                      isUserAdmin={isUserAdmin}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styleEdit.profileViewButtonContainer}>
              <Link
                to={'/userprofile/' + this.state.userProfile._id}
                className={styleEdit.profileViewButton}
              >
                <i className="fa fa-eye fa-lg" aria-hidden="true">
                  {' '}
                  View
                </i>
              </Link>
            </div>
          </Row>

          <Row style={{ display: 'flex', justifyContent: 'center', padding: 10, margin: 5 }}>
            <Button
              outline
              color="primary"
              onClick={this.handleSubmit}
              style={{ display: 'flex', margin: 5 }}
            >
              {'Save Changes'}
            </Button>
            <Button
              outline
              color="danger"
              onClick={() => window.location.reload()}
              style={{ display: 'flex', margin: 5 }}
            >
              Cancel
            </Button>
          </Row>
        </Col>
      </div>
    )
  }
}

export default EditProfile
