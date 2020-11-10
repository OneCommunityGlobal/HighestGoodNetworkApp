import React, { Component } from 'react';
import { StickyContainer } from 'react-sticky';
import { Container, Row, Col, Input, FormFeedback, FormGroup, Form, Label, Button } from 'reactstrap';
import Image from 'react-bootstrap/Image';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import './UserProfileAdd.scss';
import { createUser } from '../../../services/userProfileService';
import { toast } from 'react-toastify';

class AddUserProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      weeklyComittedHours: 10,
      formValid: {

      }
    }
  }

  render() {
    const { firstName, email, lastName, phoneNumber, weeklyComittedHours, role } = this.state;
    return <StickyContainer>
      <Container className="emp-profile">
        <Row>
          {/* <Col md="4" id="profileContainer">
            <div className="profile-img">
              <Image
                src={this.state.profilePic || '/defaultprofilepic.png'}
                alt="Profile Picture"
                roundedCircle
                className="profilePicture"
              />
              <div className="file btn btn-lg btn-primary">
                Upload Photo
              <Input
                  type="file"
                  name="newProfilePic"
                  id="newProfilePic"
                  onChange={this.handleImageUpload}
                  accept="image/png,image/jpeg, image/jpg"
                />
              </div>
            </div>
          </Col> */}
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
                    <FormFeedback>First Name Can't be null</FormFeedback>
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
                    <FormFeedback>Last Name Can't be Null</FormFeedback>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md="6">
                  <Label>Email</Label>
                </Col>
                <Col md="6">
                  <FormGroup>
                    {/* <ToggleSwitch
                      switchType="email"
                      state={email}
                      handleUserProfile={this.handleUserProfile}
                    /> */}

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
                    {/* <ToggleSwitch
                      switchType="phone"
                      state={phoneNumber}
                      handleUserProfile={this.handleUserProfile}
                    /> */}

                    <Input
                      type="number"
                      name="phoneNumber"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={this.handleUserProfile}
                      placeholder="Phone"
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
                      value={weeklyComittedHours}
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
                    <select value={role} onChange={this.handleUserProfile} id="role" name="role">
                      <option value={"Administrator"}>Administrator</option>
                      <option value={"Volunteer"}>Volunteer</option>
                    </select>
                  </FormGroup>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <Row>
          <Col>
          </Col>
          <Col>
            <Button color="primary" onClick={this.createUserProfile}>Create</Button>
          </Col>
        </Row>
      </Container>
    </StickyContainer>
  }

  createUserProfile = () => {
    const { firstName, email, lastName, phoneNumber, weeklyComittedHours, role } = this.state;
    let postData = {
      password: "Welcome123!",
      role: role,
      firstName: firstName,
      lastName: lastName,
      jobTitle: "",
      phoneNumber: phoneNumber,
      bio: "bio",
      weeklyComittedHours: weeklyComittedHours,
      personalLinks: [],
      adminLinks: [],
      teams: [],
      projects: [],
      email: email
    }
    let that = this;
    createUser(postData).then(res => {
      that.props.hitsory.push('userprofile/' + res.data._id)
    }).catch(err => {
      toast.error(err.response.data.message)
    })
  }

  handleImageUpload = async (e) => {
    e.preventDefault();

    const file = e.target.files[0];

    const allowedTypesString = 'image/png,image/jpeg, image/jpg';
    const allowedTypes = allowedTypesString.split(',');
    let isValid = true;
    let imageUploadError = '';
    if (!allowedTypes.includes(file.type)) {
      imageUploadError = `File type must be ${allowedTypesString}.`;
      isValid = false;

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      });
    }
    const filesizeKB = file.size / 1024;
    // console.log(filesizeKB);

    if (filesizeKB > 50) {
      imageUploadError = `\nThe file you are trying to upload exceeds the maximum size of 50KB. You can either 
														choose a different file, or use an online file compressor.`;
      isValid = false;

      return this.setState({
        type: 'image',
        imageUploadError,
        isValid,
        showModal: true,
        modalTitle: 'Profile Pic Error',
        modalMessage: imageUploadError,
      });
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      // console.log(reader, file);

      this.setState({
        imageUploadError: '',
        userProfile: {
          ...this.state.userProfile,
          profilePic: reader.result,
        },
      });
    };
  }

  handleUserProfile = (event) => {
    this.setState({
      showWarning: true,
    });
    const { userProfile, formValid } = this.state;
    const patt = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);
    switch (event.target.id) {
      case 'firstName':
        this.setState({
          userProfile: {
            ...userProfile,
            firstName: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            firstName: !!event.target.value,
          },
        });
        break;
      case 'lastName':
        this.setState({
          userProfile: {
            ...userProfile,
            lastName: event.target.value.trim(),
          },
          formValid: {
            ...formValid,
            lastName: !!event.target.value,
          },
        });
        break;
      case 'jobTitle':
        this.setState({
          userProfile: {
            ...userProfile,
            jobTitle: event.target.value,
          },
        });
        break;
      case 'email':
        this.setState({
          userProfile: {
            ...userProfile,
            email: event.target.value,
          },
          formValid: {
            ...formValid,
            email: patt.test(event.target.value),
          },
        });
        break;
      case 'phoneNumber':
        this.setState({
          userProfile: {
            ...userProfile,
            phoneNumber: event.target.value.trim(),
          },
        });
        break;
      case 'emailPubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              email: !userProfile.privacySettings?.email,
            },
          },
        });
        break;
      case 'phonePubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              phoneNumber: !userProfile.privacySettings?.phoneNumber,
            },
          },
        });
        break;
      case 'blueSquaresPubliclyAccessible':
        this.setState({
          userProfile: {
            ...userProfile,
            privacySettings: {
              ...userProfile.privacySettings,
              blueSquares: !userProfile.privacySettings?.blueSquares,
            },
          },
        });
        break;
      case 'totalComittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            totalComittedHours: event.target.value,
          },
        });
        break;
      case 'weeklyComittedHours':
        this.setState({
          userProfile: {
            ...userProfile,
            weeklyComittedHours: event.target.value,
          },
        });
        break;
      case 'role':
        this.setState({
          userProfile: {
            ...userProfile,
            role: event.target.value,
          },
        });
        break;
      default:
        this.setState({
          ...userProfile,
        });
    }
  };
}

export default AddUserProfile;
