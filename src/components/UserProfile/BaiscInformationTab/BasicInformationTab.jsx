import React, { useState } from 'react'
import { Row, Label, Input, Col, FormFeedback, FormGroup } from 'reactstrap'
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch'
import moment from 'moment'

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import PauseAndResumeButton from 'components/UserManagement/PauseAndResumeButton'

import TimeZoneDropDown from '../TimeZoneDropDown'

const Name = props => {
  const { userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid } = props
  const { firstName, lastName } = userProfile
  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col md="3">
          <FormGroup>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              value={firstName}
              // className={styleProfile.profileText}
              onChange={handleUserProfile}
              placeholder="First Name"
              invalid={!formValid.firstName}
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
              // className={styleProfile.profileText}
              onChange={handleUserProfile}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
            <FormFeedback>Last Name Can't be Null</FormFeedback>
          </FormGroup>
        </Col>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <Col>
        <p>{`${firstName} ${lastName}`}</p>
      </Col>
    </React.Fragment>
  )
}

const Title = props => {
  const { userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid } = props
  const { jobTitle } = userProfile

  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col>
          <FormGroup>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              onChange={handleUserProfile}
              placeholder="Job Title"
            />
          </FormGroup>
        </Col>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <Col>
        <p>{`${jobTitle}`}</p>
      </Col>
    </React.Fragment>
  )
}

const Email = props => {
  const { userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid } = props
  const { email, privacySettings } = userProfile

  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col>
          <FormGroup>
            <ToggleSwitch
              switchType="email"
              state={privacySettings?.email}
              handleUserProfile={handleUserProfile}
            />

            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={handleUserProfile}
              placeholder="Email"
              invalid={!formValid.email}
            />
            <FormFeedback>Email is not Valid</FormFeedback>
          </FormGroup>
        </Col>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      {privacySettings.email && (
        <Col>
          <p>{email}</p>
        </Col>
      )}
    </React.Fragment>
  )
}
const formatPhoneNumber = str => {
  // Filter only numbers from the input
  const cleaned = `${str}`.replace(/\D/g, '')
  if (cleaned.length === 10) {
    // Domestic (USA)
    return [
      '( ',
      cleaned.substring(0, 3),
      ' ) ',
      cleaned.substring(3, 6),
      ' - ',
      cleaned.substring(6, 10),
    ].join('')
  }
  if (cleaned.length === 11) {
    // International
    return [
      '+',
      cleaned.substring(0, 1),
      '( ',
      cleaned.substring(1, 4),
      ' ) ',
      cleaned.substring(4, 7),
      ' - ',
      cleaned.substring(7, 11),
    ].join('')
  }
  // Unconventional
  return str
}
const Phone = props => {
  const { userProfile, isUserAdmin, isUserSelf, handleUserProfile } = props
  const { phoneNumber, privacySettings } = userProfile
  if (isUserAdmin || isUserSelf) {
    return (
      <React.Fragment>
        <Col>
          <FormGroup>
            <ToggleSwitch
              switchType="phone"
              state={privacySettings?.phoneNumber}
              handleUserProfile={handleUserProfile}
            />
            <PhoneInput
              country={'us'}
              value={phoneNumber[0]}
              onChange={phone => {
                handleUserProfile({
                  target: { value: phone, name: 'phoneNumber', id: 'phoneNumber' },
                })
              }}
            />
          </FormGroup>
        </Col>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      {privacySettings.phoneNumber && (
        <Col>
          <p>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      )}
    </React.Fragment>
  )
}

const BasicInformationTab = props => {
  const { userProfile, isUserAdmin, isUserSelf, handleUserProfile, formValid } = props

  const [timeZoneFilter, setTimeZoneFilter] = useState('')

  return (
    <div data-testid="basic-info-tab">
      <Row>
        <Col>
          <Label>Name</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-name"
            id="info-name"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Name
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col>
          <Label>Title</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-title"
            id="info-title"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Title
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col>
          <Label>Email</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-email"
            id="info-email"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Email
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col>
          <Label>Phone</Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-phone"
            id="info-phone"
            style={{ fontSize: 15, cursor: 'pointer', marginLeft: 10 }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </Col>
        <Phone
          userProfile={userProfile}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
        />
      </Row>
      <Row>
        <Col>
          <Label>Video Call Preference</Label>
        </Col>
        <Col>
          <FormGroup>
            <Input
              type="text"
              name="collaborationPreference"
              id="collaborationPreference"
              value={userProfile.collaborationPreference}
              onChange={handleUserProfile}
              placeholder="Skype, Zoom, etc."
            />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Label>Role</Label>
        </Col>
        <Col>
          <FormGroup>
            <select
              value={userProfile.role}
              onChange={handleUserProfile}
              id="role"
              name="role"
              className="form-control"
              disabled={!isUserAdmin}
            >
              <option value="Administrator">Administrator</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Manager">Manager</option>
              <option value="Core Team">Core Team</option>
            </select>
          </FormGroup>
        </Col>
      </Row>
      <Row style={{ marginBottom: '10px' }}>
        <Col>
          <Label>Time Zone</Label>
        </Col>
        <Col>
          {!props.isUserAdmin && <p>{userProfile.timeZone}</p>}
          {props.isUserAdmin && (
            <TimeZoneDropDown
              filter={timeZoneFilter}
              onChange={handleUserProfile}
              selected={userProfile.timeZone}
            />
          )}
        </Col>
      </Row>
      <Row style={{ marginBottom: '10px' }}>
        <Col>
          <Label>Search For Time Zone</Label>
        </Col>
        <Col>
          <Input type="text" onChange={e => setTimeZoneFilter(e.target.value)} />
        </Col>
      </Row>
      <Row style={{ marginBottom: '10px' }}>
        <Col>
          <Label>Status</Label>
        </Col>
        <Col md="6">
        <Label>{userProfile.isActive ? "Active" : (userProfile.reactivationDate ? "Paused until " + moment(userProfile.reactivationDate).format('YYYY-MM-DD') : "Inactive")}</Label>
        &nbsp;
        {
          props.isUserAdmin && <PauseAndResumeButton isBigBtn={true} userProfile={userProfile}/>}
        </Col>
      </Row>
    </div>
  )
}
export default BasicInformationTab
