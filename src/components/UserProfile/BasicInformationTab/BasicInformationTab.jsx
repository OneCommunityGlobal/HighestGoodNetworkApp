import React, { useState } from 'react';
import { Row, Label, Input, Col, FormFeedback, FormGroup, Button } from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import moment from 'moment';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import PauseAndResumeButton from 'components/UserManagement/PauseAndResumeButton';

import TimeZoneDropDown from '../TimeZoneDropDown';
import { useSelector } from 'react-redux';
import { getUserTimeZone } from 'services/timezoneApiService';

const Name = (props) => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserAdmin,
    isUserSelf,
    formValid,
    setFormValid,
  } = props;

  const { firstName, lastName } = userProfile;

  if (isUserAdmin || isUserSelf) {
    return (
      <>
        <Col md="3">
          <FormGroup>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              value={firstName}
              // className={styleProfile.profileText}
              onChange={(e) => {
                setUserProfile({ ...userProfile, firstName: e.target.value.trim() });
                setFormValid({ ...formValid, firstName: !!e.target.value });
                setChanged(true);
              }}
              placeholder="First Name"
              invalid={!formValid.firstName}
            />
            <FormFeedback>First Name Can't be empty</FormFeedback>
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
              onChange={(e) => {
                setUserProfile({ ...userProfile, lastName: e.target.value.trim() });
                setFormValid({ ...formValid, lastName: !!e.target.value });
                setChanged(true);
              }}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
            <FormFeedback>Last Name Can't be empty</FormFeedback>
          </FormGroup>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col>
        <p>{`${firstName} ${lastName}`}</p>
      </Col>
    </>
  );
};

const Title = (props) => {
  const { userProfile, setChanged, setUserProfile, isUserAdmin, isUserSelf } = props;
  const { jobTitle } = userProfile;

  if (isUserAdmin || isUserSelf) {
    return (
      <>
        <Col>
          <FormGroup>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => {
                setUserProfile({ ...userProfile, jobTitle: e.target.value });
                setChanged(true);
              }}
              placeholder="Job Title"
            />
          </FormGroup>
        </Col>
      </>
    );
  }
  return (
    <>
      <Col>
        <p>{`${jobTitle}`}</p>
      </Col>
    </>
  );
};

const Email = (props) => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserAdmin,
    isUserSelf,
    formValid,
    setFormValid,
  } = props;
  const { email, privacySettings } = userProfile;

  const emailPattern = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);

  if (isUserAdmin || isUserSelf) {
    return (
      <>
        <Col>
          <FormGroup>
            <ToggleSwitch
              switchType="email"
              state={privacySettings?.email}
              handleUserProfile={props.handleUserProfile}
            />

            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              onChange={(e) => {
                setUserProfile({ ...userProfile, email: e.target.value });
                setFormValid({ ...formValid, email: emailPattern.test(e.target.value) });
                setChanged(true);
              }}
              placeholder="Email"
              invalid={!formValid.email}
            />
            <FormFeedback>Email is not Valid</FormFeedback>
          </FormGroup>
        </Col>
      </>
    );
  }
  return (
    <>
      {privacySettings.email && (
        <Col>
          <p>{email}</p>
        </Col>
      )}
    </>
  );
};
const formatPhoneNumber = (str) => {
  // Filter only numbers from the input
  const cleaned = `${str}`.replace(/\D/g, '');
  if (cleaned.length === 10) {
    // Domestic (USA)
    return [
      '( ',
      cleaned.substring(0, 3),
      ' ) ',
      cleaned.substring(3, 6),
      ' - ',
      cleaned.substring(6, 10),
    ].join('');
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
    ].join('');
  }
  // Unconventional
  return str;
};
const Phone = (props) => {
  const { userProfile, setUserProfile, handleUserProfile, setChanged, isUserAdmin, isUserSelf } =
    props;
  const { phoneNumber, privacySettings } = userProfile;
  if (isUserAdmin || isUserSelf) {
    return (
      <>
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
              onChange={(phoneNumber) => {
                setUserProfile({ ...userProfile, phoneNumber: phoneNumber.trim() });
                setChanged(true);
              }}
            />
          </FormGroup>
        </Col>
      </>
    );
  }
  return (
    <>
      {privacySettings.phoneNumber && (
        <Col>
          <p>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      )}
    </>
  );
};

const BasicInformationTab = (props) => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserAdmin,
    isUserSelf,
    handleUserProfile,
    formValid,
    setFormValid,
  } = props;

  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [location, setLocation] = useState('');
  const key = useSelector((state) => state.timeZoneAPI.userAPIKey);

  const onClickGetTimeZone = () => {
    if (!location) {
      alert('Please enter valid location');
      return;
    }
    if (key) {
      getUserTimeZone(location, key)
        .then((response) => {
          if (
            response.data.status.code === 200 &&
            response.data.results &&
            response.data.results.length
          ) {
            let timezone = response.data.results[0].annotations.timezone.name;
            setTimeZoneFilter(timezone);
          } else {
            alert('Invalid location or ' + response.data.status.message);
          }
        })
        .catch((err) => console.log(err));
    }
  };
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
          setUserProfile={setUserProfile}
          setFormValid={setFormValid}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
          setChanged={setChanged}
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
          setUserProfile={setUserProfile}
          setChanged={setChanged}
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
          setUserProfile={setUserProfile}
          setChanged={setChanged}
          isUserAdmin={isUserAdmin}
          isUserSelf={isUserSelf}
          handleUserProfile={handleUserProfile}
          formValid={formValid}
          setFormValid={setFormValid}
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
          setUserProfile={setUserProfile}
          setChanged={setChanged}
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
              onChange={(e) => {
                setUserProfile({ ...userProfile, collaborationPreference: e.target.value });
                setChanged(true);
              }}
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
              onChange={(e) => {
                setUserProfile({ ...userProfile, role: e.target.value });
                setChanged(true);
              }}
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
      {props.isUserAdmin && (
        <Row>
          <Col md={{ size: 6, offset: 0 }} className="text-md-left my-2">
            <Label>Location</Label>
          </Col>
          <Col md="6">
            <Row>
              <Col md="6">
                <Input onChange={(e) => setLocation(e.target.value)} />
              </Col>
              <Col md="6">
                <div className="w-100 pt-1 mb-2 mx-auto">
                  <Button color="secondary" block size="sm" onClick={onClickGetTimeZone}>
                    Get Time Zone
                  </Button>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      )}
      <Row style={{ marginBottom: '10px' }}>
        <Col>
          <Label>Time Zone</Label>
        </Col>
        <Col>
          {!props.isUserAdmin && <p>{userProfile.timeZone}</p>}
          {props.isUserAdmin && (
            <TimeZoneDropDown
              filter={timeZoneFilter}
              onChange={(e) => {
                setUserProfile({ ...userProfile, timeZone: e.target.value });
                setChanged(true);
              }}
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
          <Input type="text" onChange={(e) => setTimeZoneFilter(e.target.value)} />
        </Col>
      </Row>
      <Row style={{ marginBottom: '10px' }}>
        <Col>
          <Label>Status</Label>
        </Col>
        <Col md="6">
          <Label>
            {userProfile.isActive
              ? 'Active'
              : userProfile.reactivationDate
              ? 'Paused until ' + moment(userProfile.reactivationDate).format('YYYY-MM-DD')
              : 'Inactive'}
          </Label>
          &nbsp;
          {props.isUserAdmin && <PauseAndResumeButton isBigBtn={true} userProfile={userProfile} />}
        </Col>
      </Row>
    </div>
  );
};
export default BasicInformationTab;
