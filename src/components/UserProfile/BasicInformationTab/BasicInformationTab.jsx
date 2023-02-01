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
import hasPermission from 'utils/permissions';
import SetUpFinalDayButton from 'components/UserManagement/SetUpFinalDayButton';
import styles from './BasicInformationTab.css';

const Name = props => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserSelf,
    formValid,
    setFormValid,
    role,
    canEdit,
  } = props;

  const { firstName, lastName } = userProfile;

  if (canEdit) {
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
              onChange={e => {
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
              onChange={e => {
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

const Title = props => {
  const { userProfile, setChanged, setUserProfile, isUserSelf, role, canEdit } = props;
  const { jobTitle } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col>
          <FormGroup>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              onChange={e => {
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

const Email = props => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserSelf,
    formValid,
    setFormValid,
    role,
    canEdit,
  } = props;
  const { email, privacySettings } = userProfile;

  const emailPattern = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);

  if (canEdit) {
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
              onChange={e => {
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
      {privacySettings?.email && (
        <Col>
          <p>{email}</p>
        </Col>
      )}
    </>
  );
};

const formatPhoneNumber = str => {
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
const Phone = props => {
  const {
    userProfile,
    setUserProfile,
    handleUserProfile,
    setChanged,
    isUserSelf,
    role,
    canEdit,
  } = props;
  const { phoneNumber, privacySettings } = userProfile;
  if (canEdit) {
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
              onChange={phoneNumber => {
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
      {privacySettings?.phoneNumber && (
        <Col>
          <p>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      )}
    </>
  );
};

const TimeZoneDifference = props => {
  const { userProfile, setChanged, setUserProfile, isUserAdmin, isUserSelf } = props;

  const viewingTimeZone = props.userProfile.timeZone;
  const yourLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function getOffsetBetweenTimezonesForDate(date, timezone1, timezone2) {
    const timezone1Date = convertDateToAnotherTimeZone(date, timezone1);
    const timezone2Date = convertDateToAnotherTimeZone(date, timezone2);
    return timezone1Date.getTime() - timezone2Date.getTime();
  }

  function convertDateToAnotherTimeZone(date, timezone) {
    const dateString = date.toLocaleString('en-US', {
      timeZone: timezone,
    });
    return new Date(dateString);
  }

  let date = new Date();
  const offset = getOffsetBetweenTimezonesForDate(date, viewingTimeZone, yourLocalTimeZone);
  const offsetInHours = offset / 3600000;
  const signedOffset = offsetInHours > 0 ? '+' + offsetInHours : '' + offsetInHours;

  if (!isUserSelf) {
    return (
      <>
        <Col>
          <p>{signedOffset} hours</p>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col>
        <p>This is your own profile page</p>
      </Col>
    </>
  );
};

const BasicInformationTab = props => {
  const {
    userProfile,
    setUserProfile,
    setChanged,
    isUserSelf,
    handleUserProfile,
    formValid,
    setFormValid,
    role,
    canEdit,
    roles,
    userPermissions,
  } = props;
  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [location, setLocation] = useState('');
  const key = useSelector(state => state.timeZoneAPI.userAPIKey);

  const onClickGetTimeZone = () => {
    if (!location) {
      alert('Please enter valid location');
      return;
    }
    if (key) {
      getUserTimeZone(location, key)
        .then(response => {
          if (
            response.data.status.code === 200 &&
            response.data.results &&
            response.data.results.length
          ) {
            let timezone = response.data.results[0].annotations.timezone.name;
            setTimeZoneFilter(timezone);
            setUserProfile({ ...userProfile, timeZone: timezone });
            setChanged(true);
          } else {
            alert('Invalid location or ' + response.data.status.message);
          }
        })
        .catch(err => console.log(err));
    }
  };
  return (
    <div>
      <div data-testid="basic-info-tab" className="basic-info-tab-desktop">
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            setChanged={setChanged}
            role={props.role}
            canEdit={canEdit}
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            role={props.role}
            canEdit={canEdit}
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            setFormValid={setFormValid}
            role={props.role}
            canEdit={canEdit}
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            role={props.role}
            canEdit={canEdit}
          />
        </Row>
        <Row>
          <Col>
            <Label>Video Call Preference</Label>
          </Col>
          <Col>
            {canEdit ? (
              <FormGroup disabled={!canEdit}>
                <Input
                  type="text"
                  name="collaborationPreference"
                  id="collaborationPreference"
                  value={userProfile.collaborationPreference}
                  onChange={e => {
                    setUserProfile({ ...userProfile, collaborationPreference: e.target.value });
                    setChanged(true);
                  }}
                  placeholder="Skype, Zoom, etc."
                />
              </FormGroup>
            ) : (
              `${userProfile.collaborationPreference}`
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <Label>Role</Label>
          </Col>
          <Col>
            {canEdit ? (
              <FormGroup>
                <select
                  value={userProfile.role}
                  onChange={e => {
                    setUserProfile({ ...userProfile, role: e.target.value });
                    setChanged(true);
                  }}
                  id="role"
                  name="role"
                  className="form-control"
                  disabled={!canEdit}
                  canEdit={canEdit}
                >
                  {roles.map(({ roleName }) => {
                    if (roleName === 'Owner') return;
                    return <option value={roleName}>{roleName}</option>;
                  })}
                  {hasPermission(role, 'addDeleteEditOwners', roles, userPermissions) && (
                    <option value="Owner">Owner</option>
                  )}
                </select>
              </FormGroup>
            ) : (
              `${userProfile.role}`
            )}
          </Col>
        </Row>
        {canEdit && (
          <Row>
            <Col md={{ size: 6, offset: 0 }} className="text-md-left my-2">
              <Label>Location</Label>
            </Col>
            <Col md="6">
              <Row>
                <Col md="6">
                  <Input
                    onChange={e => {
                      setLocation(e.target.value);
                      setUserProfile({ ...userProfile, location: e.target.value });
                      setChanged(true);
                    }}
                    value={userProfile.location}
                  />
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
            {!canEdit && <p>{userProfile.timeZone}</p>}
            {canEdit && (
              <TimeZoneDropDown
                filter={timeZoneFilter}
                onChange={e => {
                  setUserProfile({ ...userProfile, timeZone: e.target.value });
                  setChanged(true);
                }}
                selected={userProfile.timeZone}
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <label>Difference in this Time Zone from Your Local</label>
          </Col>
          <TimeZoneDifference
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setChanged={setChanged}
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
          />
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
            {canEdit && <PauseAndResumeButton isBigBtn={true} userProfile={userProfile} />}
          </Col>
        </Row>
        <Row style={{ marginBottom: '10px' }}>
          <Col>
            <Label>
              {userProfile.endDate
                ? 'End Date ' + userProfile.endDate.toLocaleString().split('T')[0]
                : 'End Date ' + 'N/A'}
            </Label>
          </Col>
          <Col md="6">
            {canEdit && <SetUpFinalDayButton isBigBtn={true} userProfile={userProfile} />}
          </Col>
        </Row>
      </div>
      <div data-testid="basic-info-tab" className="basic-info-tab-tablet">
        <Col className="cols">
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            setChanged={setChanged}
            role={props.role}
            canEdit={canEdit}
          />
        </Col>
        <Col className="cols">
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            role={props.role}
            canEdit={canEdit}
          />
        </Col>
        <Col className="cols">
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            setFormValid={setFormValid}
            role={props.role}
            canEdit={canEdit}
          />
        </Col>
        <Col className="cols">
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
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
            role={props.role}
            canEdit={canEdit}
          />
        </Col>
        <Col className="cols">
          <Col>
            <Label>Video Call Preference</Label>
          </Col>
          <Col>
            {canEdit ? (
              <FormGroup disabled={!canEdit}>
                <Input
                  type="text"
                  name="collaborationPreference"
                  id="collaborationPreference"
                  value={userProfile.collaborationPreference}
                  onChange={e => {
                    setUserProfile({ ...userProfile, collaborationPreference: e.target.value });
                    setChanged(true);
                  }}
                  placeholder="Skype, Zoom, etc."
                />
              </FormGroup>
            ) : (
              `${userProfile.collaborationPreference}`
            )}
          </Col>
        </Col>
        <Col className="cols">
          <Col>
            <Label>Role</Label>
          </Col>
          <Col>
            {canEdit ? (
              <FormGroup>
                <select
                  value={userProfile.role}
                  onChange={e => {
                    setUserProfile({ ...userProfile, role: e.target.value });
                    setChanged(true);
                  }}
                  id="role"
                  name="role"
                  className="form-control"
                  disabled={!canEdit}
                  canEdit={canEdit}
                >
                  {roles.map(({ roleName }) => {
                    if (roleName === 'Owner') return;
                    return <option value={roleName}>{roleName}</option>;
                  })}
                  {hasPermission(role, 'addDeleteEditOwners', roles, userPermissions) && (
                    <option value="Owner">Owner</option>
                  )}
                </select>
              </FormGroup>
            ) : (
              `${userProfile.role}`
            )}
          </Col>
        </Col>
        <hr />
        {canEdit && (
          <Col className="cols">
            <Col>
              <Label>Location</Label>
            </Col>

            <Col className="cols">
              <Input
                onChange={e => {
                  setLocation(e.target.value);
                  setUserProfile({ ...userProfile, location: e.target.value });
                  setChanged(true);
                }}
                value={userProfile.location}
                style={{ marginBottom: '10px' }}
              />

              <div>
                <Button color="secondary" block size="sm" onClick={onClickGetTimeZone}>
                  Get Time Zone
                </Button>
              </div>
            </Col>
          </Col>
        )}
        <Col className="cols">
          <Col>
            <Label>Time Zone</Label>
          </Col>
          <Col>
            {!canEdit && <p>{userProfile.timeZone}</p>}
            {canEdit && (
              <TimeZoneDropDown
                filter={timeZoneFilter}
                onChange={e => {
                  setUserProfile({ ...userProfile, timeZone: e.target.value });
                  setChanged(true);
                }}
                selected={userProfile.timeZone}
              />
            )}
          </Col>
        </Col>
        <Col className="cols">
          <Col>
            <label>Difference in this Time Zone from Your Local</label>
          </Col>
          <TimeZoneDifference
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            setChanged={setChanged}
            isUserSelf={isUserSelf}
            handleUserProfile={handleUserProfile}
            formValid={formValid}
          />
        </Col>
        <hr />
        <Col className="cols">
          <Col>
            <Label>Status</Label>
          </Col>
          <Col md="6">
            <Label style={{ fontWeight: 'normal' }}>
              {userProfile.isActive
                ? 'Active'
                : userProfile.reactivationDate
                ? 'Paused until ' + moment(userProfile.reactivationDate).format('YYYY-MM-DD')
                : 'Inactive'}
            </Label>
            &nbsp;
            {canEdit && <PauseAndResumeButton isBigBtn={true} userProfile={userProfile} />}
          </Col>
        </Col>
        <Col>
          <Col>
            <Label>
              {userProfile.endDate
                ? 'End Date ' + userProfile.endDate.toLocaleString().split('T')[0]
                : 'End Date ' + 'N/A'}
            </Label>
          </Col>
          <Col md="6">
            {canEdit && <SetUpFinalDayButton isBigBtn={true} userProfile={userProfile} />}
          </Col>
        </Col>
      </div>
    </div>
  );
};
export default BasicInformationTab;
