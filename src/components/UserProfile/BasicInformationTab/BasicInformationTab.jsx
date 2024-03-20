import React, { useState, useEffect } from 'react';
import { Row, Label, Input, Col, FormFeedback, FormGroup, Button } from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
import PauseAndResumeButton from 'components/UserManagement/PauseAndResumeButton';
import TimeZoneDropDown from '../TimeZoneDropDown';
import { connect } from 'react-redux';
import hasPermission from 'utils/permissions';
import SetUpFinalDayButton from 'components/UserManagement/SetUpFinalDayButton';
import styles from './BasicInformationTab.css';
import { boxStyle } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { formatDate } from 'utils/formatDate';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { isString } from 'lodash';
import { toast } from 'react-toastify';


const Name = props => {
  const { userProfile, setUserProfile, formValid, setFormValid, canEdit, desktopDisplay } = props;
  const { firstName, lastName } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '3' : ''}>
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
              }}
              placeholder="First Name"
              invalid={!formValid.firstName}
            />
            <FormFeedback>First Name Can&apos;t be empty</FormFeedback>
          </FormGroup>
        </Col>
        <Col md={desktopDisplay ? '3' : ''}>
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
              }}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
            <FormFeedback>Last Name Can&apos;t be empty</FormFeedback>
          </FormGroup>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col>
        <p className="text-right">{`${firstName} ${lastName}`}</p>
      </Col>
    </>
  );
};

const Title = props => {
  const { userProfile, setUserProfile, canEdit, desktopDisplay } = props;
  const { jobTitle } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              onChange={e => {
                setUserProfile({ ...userProfile, jobTitle: e.target.value });
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
        <p className='text-right'>{`${jobTitle}`}</p>
      </Col>
    </>
  );
};

const Email = props => {
  const { userProfile, setUserProfile, formValid, setFormValid, canEdit, desktopDisplay } = props;
  const { email, privacySettings, emailSubscriptions } = userProfile;

  const emailPattern = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
            <ToggleSwitch
              switchType="email"
              state={privacySettings?.email}
              handleUserProfile={props.handleUserProfile}
            />

            <ToggleSwitch
              switchType="email-subcription"
              state={emailSubscriptions? emailSubscriptions : false}
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
          <p className='text-right'>{email}</p>
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
  const { userProfile, setUserProfile, handleUserProfile, canEdit, desktopDisplay } = props;
  const { phoneNumber, privacySettings } = userProfile;
  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
            <ToggleSwitch
              switchType="phone"
              state={privacySettings?.phoneNumber}
              handleUserProfile={handleUserProfile}
            />
            <PhoneInput
              inputClass="phone-input-style"
              country={'us'}
              value={phoneNumber}
              onChange={phoneNumber => {
                setUserProfile({ ...userProfile, phoneNumber: phoneNumber.trim() });
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
          <p className='text-right'>{formatPhoneNumber(phoneNumber)}</p>
        </Col>
      )}
    </>
  );
};

const TimeZoneDifference = props => {
  const { isUserSelf, errorOccurred, setErrorOccurred, desktopDisplay } = props;
  const [signedOffset, setSignedOffset] = useState('');
  const viewingTimeZone = props.userProfile.timeZone;
  const yourLocalTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const getOffsetBetweenTimezonesForDate = (date, timezone1, timezone2) => {
      const timezone1Date = convertDateToAnotherTimeZone(date, timezone1);
      const timezone2Date = convertDateToAnotherTimeZone(date, timezone2);
      if (!isNaN(timezone1Date) && !isNaN(timezone2Date)) {
        return timezone1Date.getTime() - timezone2Date.getTime();
      } else {
        if (!errorOccurred) {
          toast.error('Error occurred while trying to calculate offset between timezones');
          setErrorOccurred(true);
        }
        return 0;
      }
    };

    const convertDateToAnotherTimeZone = (date, timezone) => {
      try {
        const dateString = date.toLocaleString('en-US', {
          timeZone: timezone,
        });
        return new Date(dateString);
      } catch (err) {
        return err;
      }
    };

    let date = new Date();
    const offset = getOffsetBetweenTimezonesForDate(date, viewingTimeZone, yourLocalTimeZone);
    const offsetInHours = offset / 3600000;
    setSignedOffset(offsetInHours > 0 ? '+' + offsetInHours : '' + offsetInHours);
  }, [isUserSelf, setErrorOccurred, errorOccurred, viewingTimeZone, yourLocalTimeZone]);

  if (!isUserSelf) {
    return (
      <>
        <Col md="6">
          <p className='text-right'>{signedOffset} hours</p>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col md={desktopDisplay ? '6' : ''}>
        <p className={desktopDisplay ? 'text-right' : 'text-left'}>This is your own profile page</p>
      </Col>
    </>
  );
};

const BasicInformationTab = props => {
  const {
    userProfile,
    setUserProfile,
    isUserSelf,
    handleUserProfile,
    formValid,
    setFormValid,
    canEdit,
    canEditRole,
    roles,
    role,
    loadUserProfile,
  } = props;
  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [desktopDisplay, setDesktopDisplay] = useState(window.innerWidth > 1024);
  const [errorOccurred, setErrorOccurred] = useState(false);

  let topMargin = '6px';
  if (isUserSelf) {
    topMargin = '0px';
  }

  const canAddDeleteEditOwners = props.hasPermission('addDeleteEditOwners');
  const handleLocation = e => {
    setUserProfile({
      ...userProfile,
      location: {
        userProvided: e.target.value,
        coords: { lat: '', lng: '' },
        country: '',
        city: '',
      },
    });
  };
  const onClickGetTimeZone = () => {
    if (!userProfile.location.userProvided) {
      alert('Please enter valid location');
      return;
    }

    axios.get(ENDPOINTS.TIMEZONE_LOCATION(userProfile.location.userProvided)).then(res => {
      if (res.status === 200) {
        const {timezone, currentLocation } = res.data;
        setTimeZoneFilter(timezone);
        setUserProfile({ ...userProfile, timeZone: timezone, location: currentLocation });
      } 
    }).catch(err => {
      toast.error(`An error occurred : ${err.response.data}`);
      if (errorOccurred) setErrorOccurred(false);
    });
  };

  function locationCheckValue(loc) {
    if (loc.userProvided) return loc.userProvided;
    const str = isString(loc);
    return str ? loc : '';
  }

  const handleResize = () => {
    setDesktopDisplay(window.innerWidth > 1024);
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nameComponent = (
    <>
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
        role={props.role}
        canEdit={canEdit}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const titleComponent = (
    <>
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
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        role={props.role}
        canEdit={canEdit}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const emailComponent = (
    <>
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
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        setFormValid={setFormValid}
        role={props.role}
        canEdit={canEdit}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const phoneComponent = (
    <>
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
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        role={props.role}
        canEdit={canEdit}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const videoCallPreferenceComponent = (
    <>
      <Col>
        <Label>Video Call Preference</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {canEdit ? (
          <FormGroup disabled={!canEdit}>
            <Input
              type="text"
              name="collaborationPreference"
              id="collaborationPreference"
              value={userProfile.collaborationPreference}
              onChange={e => {
                setUserProfile({ ...userProfile, collaborationPreference: e.target.value });
              }}
              placeholder="Skype, Zoom, etc."
            />
          </FormGroup>
        ) : (
          `${userProfile.collaborationPreference}`
        )}
      </Col>
    </>
  );

  const roleComponent = (
    <>
      <Col>
        <Label>Role</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {canEditRole ? (
          <FormGroup>
            <select
              value={userProfile.role}
              onChange={e => {
                setUserProfile({
                  ...userProfile,
                  role: e.target.value,
                  permissions: { ...userProfile.permissions, frontPermissions: [] },
                });
              }}
              id="role"
              name="role"
              className="form-control"
            >
              {roles.map(({ roleName }) => {
                if (roleName === 'Owner') return;
                return (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                );
              })}
              {canAddDeleteEditOwners && (
                <option value="Owner" style={desktopDisplay ? { marginLeft: '5px' } : {}}>
                  Owner
                </option>
              )}
            </select>
          </FormGroup>
        ) : (
          `${userProfile.role}`
        )}
      </Col>
      {desktopDisplay ? (
        <Col md="1">
          <div style={{ marginTop: topMargin, marginLeft: '-20px' }}>
            <EditableInfoModal role={role} areaName={'roleInfo'} areaTitle="Roles" fontSize={20}/>
          </div>
        </Col>
      ) : (
        <hr />
      )}
    </>
  );

  const locationComponent = (
    <>
      {canEdit && (
        <>
          <Col md={{ size: 5, offset: 0 }}>
            <Label>Location</Label>
          </Col>
          {desktopDisplay ? (
            <Col md='6'>
              <Row className="ml-0">
                <Col className="p-0" style={{ marginRight: '10px' }}>
                  <Input
                    onChange={handleLocation}
                    value={locationCheckValue(userProfile.location || '')}
                  />
                </Col>
                <Col>
                  <Button
                    color="secondary"
                    block
                    onClick={onClickGetTimeZone}
                    style={boxStyle}
                    className="px-0"
                  >
                    Get Time Zone
                  </Button>
                </Col>
              </Row>
            </Col>
          ) : (
            <Col className="cols">
              <Input onChange={handleLocation} value={userProfile.location.userProvided || ''} />
              <div>
                <Button color="secondary" block size="sm" onClick={onClickGetTimeZone} className="mt-2">
                  Get Time Zone
                </Button>
              </div>
            </Col>
          )}
        </>
      )}
    </>
  );

  const timeZoneComponent = (
    <>
      <Col>
        <Label>Time Zone</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {!canEdit && <p>{userProfile.timeZone}</p>}
        {canEdit && (
          <TimeZoneDropDown
            filter={timeZoneFilter}
            onChange={e => {
              setUserProfile({ ...userProfile, timeZone: e.target.value });
            }}
            selected={userProfile.timeZone}
          />
        )}
      </Col>
    </>
  );

  const timeZoneDifferenceComponent = (
    <>
      <Col md={desktopDisplay ? '5' : ''}>
        <label>Difference in this Time Zone from Your Local</label>
      </Col>
      <TimeZoneDifference
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const endDateComponent = (
    <>
      <Col md={desktopDisplay ? '8' : ''} className="mr-5">
        <Label className='mr-1'>
          {userProfile.endDate
            ? 'End Date ' + formatDate(userProfile.endDate)
            : 'End Date ' + 'N/A'}
        </Label>
        {canEdit && !desktopDisplay && (
          <SetUpFinalDayButton
            loadUserProfile={loadUserProfile}
            setUserProfile={setUserProfile}
            isBigBtn={true}
            userProfile={userProfile}
          />
        )}
      </Col>
      {desktopDisplay && canEdit && (
        <Col>
          <SetUpFinalDayButton
            loadUserProfile={loadUserProfile}
            setUserProfile={setUserProfile}
            isBigBtn={true}
            userProfile={userProfile}
          />
        </Col>
      )}
    </>
  );

  const statusComponent = (
    <>
      {desktopDisplay ? (
        <>
          <Col md="8" className="mr-5">
            <Label>Status</Label>
          </Col>
          <Col>
            <Label>
              {userProfile.isActive
                ? 'Active'
                : userProfile.reactivationDate
                ? 'Paused until ' + formatDate(userProfile.reactivationDate)
                : 'Inactive'}
            </Label>
            &nbsp;
            {canEdit && (
              <PauseAndResumeButton
                setUserProfile={setUserProfile}
                loadUserProfile={loadUserProfile}
                isBigBtn={true}
                userProfile={userProfile}
              />
            )}
          </Col>
        </>
      ) : (
        <>
          <Col md="9">
            <Label>Status</Label>
            <div>
              <Label style={{ fontWeight: 'normal' }}>
                {userProfile.isActive
                  ? 'Active'
                  : userProfile.reactivationDate
                  ? 'Paused until ' + formatDate(userProfile.reactivationDate)
                  : 'Inactive'}
              </Label>
              &nbsp;
              {canEdit && (
                <PauseAndResumeButton
                  setUserProfile={setUserProfile}
                  loadUserProfile={loadUserProfile}
                  isBigBtn={true}
                  userProfile={userProfile}
                />
              )}
            </div>
          </Col>
          {endDateComponent}
        </>
      )}
    </>
  );

  return (
    <div>
      <div
        data-testid="basic-info-tab"
        className={desktopDisplay ? 'basic-info-tab-desktop' : 'basic-info-tab-tablet'}
      >
        {desktopDisplay ? (
          <>
            <Row>
              {nameComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>
              {titleComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>
              {emailComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>
              {phoneComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>
              {videoCallPreferenceComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>{roleComponent}</Row>
            <Row>
              {locationComponent}
              <Col md="1"></Col>
            </Row>
            <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
              {timeZoneComponent}
              <Col md="1"></Col>
            </Row>
            <Row>{timeZoneDifferenceComponent}</Row>
            <Row style={{ marginBottom: '10px' }}>{statusComponent}</Row>
            <Row style={{ marginBottom: '10px' }}>{endDateComponent}</Row>
          </>
        ) : (
          <>
            <Col className="cols">{nameComponent}</Col>
            <Col className="cols">{titleComponent}</Col>
            <Col className="cols">{emailComponent}</Col>
            <Col className="cols">{phoneComponent}</Col>
            <Col className="cols">{videoCallPreferenceComponent}</Col>
            <Col className="cols">{roleComponent}</Col>
            <Col className="cols">{locationComponent}</Col>
            <Col className="cols">{timeZoneComponent}</Col>
            <Col className="cols">{timeZoneDifferenceComponent}</Col>
            <hr />
            <Row xs="2" style={{ marginLeft: '1rem' }}>
              {statusComponent}
            </Row>
          </>
        )}
      </div>
    </div>
  );
};
export default connect(null, { hasPermission })(BasicInformationTab);
