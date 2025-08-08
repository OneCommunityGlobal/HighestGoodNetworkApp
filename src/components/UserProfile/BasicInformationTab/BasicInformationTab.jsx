import React, { useState, useEffect, useRef } from 'react';
import { Row, Label, Input, Col, FormFeedback, FormGroup, Button } from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
// import 'react-phone-input-2/lib/style.css';
import PauseAndResumeButton from '~/components/UserManagement/PauseAndResumeButton';
import TimeZoneDropDown from '../TimeZoneDropDown';
import { connect } from 'react-redux';
import hasPermission from '~/utils/permissions';
import SetUpFinalDayButton from '~/components/UserManagement/SetUpFinalDayButton';
import './BasicInformationTab.css';
import { boxStyle, boxStyleDark } from '~/styles';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { formatDateLocal } from '~/utils/formatDate';
import { ENDPOINTS } from '~/utils/URL';
import axios from 'axios';
import { isString } from 'lodash';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';

const Name = props => {
  const {
    userProfile,
    setUserProfile,
    formValid,
    setFormValid,
    canEdit,
    desktopDisplay,
    darkMode,
  } = props;

  const { firstName, lastName } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '3' : ''} style={{paddingRight: 0}}>
          <FormGroup>
            <div style={{position: 'relative'}}>
            <Input
              type="text"
              name="firstName"
              id="firstName"
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              value={firstName}
              // className={styleProfile.profileText}
              onChange={e => {
                setUserProfile({ ...userProfile, firstName: e.target.value });
                setFormValid({ ...formValid, firstName: !!e.target.value.trim() });
              }}
              onBlur={e => {
                const cleanedValue = e.target.value.replace(/\s+/g, ' ').trim();
                setUserProfile(prev => ({ ...prev, firstName: cleanedValue }));
              }}
              placeholder="First Name"
              invalid={!formValid.firstName}
            />
            <FontAwesomeIcon
              icon={faCopy}
              title="Copy first name"
              onClick={() => {
                navigator.clipboard.writeText(firstName);
                toast.success('First Name copied!');
              }}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                fontSize: '1rem',
                color: darkMode ? '#fff' : '#000',
                top: '50%',
                right: '10px', 
                transform: 'translateY(-50%)',
              }}
            />
            </div>
            <FormFeedback>First Name Can&apos;t be empty</FormFeedback>
          </FormGroup>
        </Col>
        <Col md={desktopDisplay ? '3' : ''}>
          <FormGroup>
          <div style={{position: 'relative'}}>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              value={lastName}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              // className={styleProfile.profileText}
              onChange={e => {
                setUserProfile({ ...userProfile, lastName: e.target.value });
                setFormValid({
                  ...formValid,
                  lastName: !!e.target.value && e.target.value.trim().length >= 2,
                });
              }}
              onBlur={e => {
                const cleanedValue = e.target.value.replace(/\s+/g, ' ').trim();
                setUserProfile(prev => ({ ...prev, lastName: cleanedValue }));
              }}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
            <FontAwesomeIcon
              icon={faCopy}
              title="Copy last name"
              onClick={() => {
                navigator.clipboard.writeText(lastName);
                toast.success('Last Name copied!');
              }}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                fontSize: '1rem',
                color: darkMode ? '#fff' : '#000',
                top: '50%',
                right: '10px', 
                transform: 'translateY(-50%)',
              }}
            />
            </div>
            <FormFeedback>Last Name Can&apos;t have less than 2 characters</FormFeedback>
          </FormGroup>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col>
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{`${firstName} ${lastName}`}</p>
      </Col>
    </>
  );
};

const Title = props => {
  const { userProfile, setUserProfile, canEdit, desktopDisplay, darkMode } = props;

  const { jobTitle } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
            <div style={{position: 'relative', width: '100%'}}>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              value={jobTitle}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              onChange={e => {
                setUserProfile({ ...userProfile, jobTitle: e.target.value });
              }}
              placeholder="Job Title"
              style={{ paddingRight: '2.5rem' }}
            />
            <FontAwesomeIcon
              icon={faCopy}
              title="Copy title"
              onClick={() => {
                navigator.clipboard.writeText(jobTitle);
                toast.success('Title copied!');
              }}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                fontSize: '1rem',
                color: darkMode ? '#fff' : '#000',
                top: '50%',
                right: '10px', 
                transform: 'translateY(-50%)',
              }}
            />
            </div>
          </FormGroup>
        </Col>
      </>
    );
  }
  return (
    <>
      <Col>
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{`${jobTitle}`}</p>
      </Col>
    </>
  );
};

const Email = props => {
  const {
    userProfile,
    setUserProfile,
    formValid,
    setFormValid,
    canEdit,
    desktopDisplay,
    darkMode,
  } = props;

  const { email, privacySettings, emailSubscriptions } = userProfile;

  const emailPattern = new RegExp(/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i);

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
            <div style={{position: 'relative', width: '100%' }}>
            <Input
              type="email"
              name="email"
              id="email"
              value={email}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              onChange={e => {
                setUserProfile({ ...userProfile, email: e.target.value });
                setFormValid({ ...formValid, email: emailPattern.test(e.target.value) });
              }}
              placeholder="Email"
              invalid={!formValid.email}
            />
            <FontAwesomeIcon
              icon={faCopy}
              title="Copy email"
              onClick={() => {
                navigator.clipboard.writeText(email);
                toast.success('Email copied!');
              }}
              style={{
                position: 'absolute',
                cursor: 'pointer',
                fontSize: '1rem',
                color: darkMode ? '#fff' : '#000',
                top: '50%',
                right: '10px', 
                transform: 'translateY(-50%)',
              }}
            />
            </div>
            <ToggleSwitch
              switchType="email"
              state={privacySettings?.email}
              handleUserProfile={props.handleUserProfile}
              darkMode={darkMode}
            />

            <ToggleSwitch
              switchType="email-subcription"
              state={emailSubscriptions ? emailSubscriptions : false}
              handleUserProfile={props.handleUserProfile}
              darkMode={darkMode}
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
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{email}</p>
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
    canEdit,
    desktopDisplay,
    darkMode,
  } = props;
  const { phoneNumber, privacySettings } = userProfile;
  const phoneInputWrapperRef = useRef(null);
  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''}>
          <FormGroup>
          <div style={{ position: 'relative' }} ref={phoneInputWrapperRef}>
            <PhoneInput
              buttonClass={`${darkMode ? 'bg-darkmode-liblack' : ''}`}
              inputClass={`phone-input-style ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              country={'us'}
              value={phoneNumber}
              onChange={phoneNumber => {
                setUserProfile({ ...userProfile, phoneNumber: phoneNumber.trim() });
              }}
            />
            <FontAwesomeIcon
              icon={faCopy}
              onClick={() => {
                const input = phoneInputWrapperRef.current?.querySelector('input');
                if (input) {
                  navigator.clipboard.writeText(input.value);
                  toast.success('Phone number copied!');
                }
              }}
              title="Copy phone number"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '1rem',
                color: darkMode ? '#fff' : '#000',
                zIndex: 2,
              }}
            />
          </div>
            <ToggleSwitch
              switchType="phone"
              state={privacySettings?.phoneNumber}
              handleUserProfile={handleUserProfile}
              darkMode={darkMode}
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
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>
            {formatPhoneNumber(phoneNumber)}
          </p>
        </Col>
      )}
    </>
  );
};

const TimeZoneDifference = props => {
  const { isUserSelf, errorOccurred, setErrorOccurred, desktopDisplay, darkMode } = props;

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
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{signedOffset} hours</p>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col md={desktopDisplay ? '6' : ''}>
        <p
          className={`${darkMode ? 'text-light' : ''} ${
            desktopDisplay ? 'text-right' : 'text-left'
          }`}
        >
          This is your own profile page
        </p>
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
    darkMode,
  } = props;
  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [desktopDisplay, setDesktopDisplay] = useState(window.innerWidth > 1024);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const dispatch = useDispatch();
  const rolesAllowedToEditStatusFinalDay = ['Administrator', 'Owner'];
  const canEditStatus =
  rolesAllowedToEditStatusFinalDay.includes(role) || dispatch(hasPermission('pauseUserActivity'));

  const canEditEndDate =
  rolesAllowedToEditStatusFinalDay.includes(role) || dispatch(hasPermission('setUserFinalDay'));


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

    axios
      .get(ENDPOINTS.TIMEZONE_LOCATION(userProfile.location.userProvided))
      .then(res => {
        if (res.status === 200) {
          const { timezone, currentLocation } = res.data;
          setTimeZoneFilter(timezone);
          setUserProfile({ ...userProfile, timeZone: timezone, location: currentLocation });
        }
      })
      .catch(err => {
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
        <span className="label-icon-container">
          <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>
            Name
          </Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-name"
            id="info-name"
            style={{ fontSize: 15, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </span>
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
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const titleComponent = (
    <>
      <Col>
        <span className="label-icon-container">
          <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>
            Title
          </Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-title"
            id="info-title"
            style={{ fontSize: 15, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </span>
      </Col>
      <Title
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        role={props.role}
        canEdit={canEdit}
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const emailComponent = (
    <>
      <Col>
        <span className="label-icon-container">
          <Label className={darkMode ? 'text-light label-with-icon' : ' label-with-icon'}>
            Email
          </Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-email"
            id="info-email"
            style={{ fontSize: 15, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </span>
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
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const phoneComponent = (
    <>
      <Col>
        <span className="label-icon-container">
          <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>
            Phone
          </Label>
          <i
            data-toggle="tooltip"
            data-placement="right"
            data-testid="info-phone"
            id="info-phone"
            style={{ fontSize: 15, cursor: 'pointer' }}
            aria-hidden="true"
            className="fa fa-info-circle"
          />
        </span>
      </Col>
      <Phone
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        role={props.role}
        canEdit={canEdit}
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const videoCallPreferenceComponent = (
    <>
      <Col>
        <Label className={darkMode ? 'text-light' : ''}>Video Call Preference</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {canEdit ? (
          <FormGroup disabled={!canEdit}>
            <Input
              type="text"
              name="collaborationPreference"
              id="collaborationPreference"
              value={userProfile.collaborationPreference}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
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
        <Label className={darkMode ? 'text-light' : ''}>Role</Label>
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
              className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
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
          <div style={{ marginTop: topMargin, }}>
            <EditableInfoModal
              role={role}
              areaName={'roleInfo'}
              areaTitle="Roles"
              fontSize={20}
              darkMode={darkMode}
            />
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
            <Label className={darkMode ? 'text-light' : ''}>Location</Label>
          </Col>
          {desktopDisplay ? (
            <Col md="6" style={{paddingRight: 0}}>
              <Row className="ml-0">
                <Col className="p-0">
                  <Input
                    onChange={handleLocation}
                    value={locationCheckValue(userProfile.location || '')}
                    className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
                  />
                </Col>
                <Col style={{paddingRight: 0}}>
                  <Button
                    color="secondary"
                    block
                    onClick={onClickGetTimeZone}
                    style={darkMode ? boxStyleDark : boxStyle}
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
                <Button
                  color="secondary"
                  block
                  size="sm"
                  onClick={onClickGetTimeZone}
                  className="mt-2"
                >
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
        <Label className={darkMode ? 'text-light' : ''}>Time Zone</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {!canEdit && <p className={darkMode ? 'text-light' : ''}>{userProfile.timeZone}</p>}
        {canEdit && (
          <TimeZoneDropDown
            filter={timeZoneFilter}
            onChange={e => {
              setUserProfile({ ...userProfile, timeZone: e.target.value });
            }}
            selected={userProfile.timeZone}
            darkMode={darkMode}
          />
        )}
      </Col>
    </>
  );

  const timeZoneDifferenceComponent = (
    <>
      <Col md={desktopDisplay ? '5' : ''}>
        <label className={darkMode ? 'text-light' : ''}>
          Difference in this Time Zone from Your Local
        </label>
      </Col>
      <TimeZoneDifference
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        isUserSelf={isUserSelf}
        handleUserProfile={handleUserProfile}
        formValid={formValid}
        errorOccurred={errorOccurred}
        setErrorOccurred={setErrorOccurred}
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const endDateComponent = (
  <>
    {desktopDisplay ? (
      <Row
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '15px',
        }}
      >
        <Col
          md="7"
          className="mr-5"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Label style={{ margin: '0' }} className={`mr-1 ${darkMode ? 'text-light' : ''}`}>
            {userProfile.endDate
              ? 'End Date ' + userProfile.endDate.substring(0, 10)
              : 'End Date ' + 'N/A'}
          </Label>
        </Col>
        {canEdit && canEditEndDate && (
          <Col
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <SetUpFinalDayButton
              loadUserProfile={loadUserProfile}
              setUserProfile={setUserProfile}
              isBigBtn={true}
              userProfile={userProfile}
              darkMode={darkMode}
              onFinalDaySave={(updatedUser) => {
                setUserProfile(updatedUser);
                loadUserProfile();
              }}
            />
          </Col>
        )}
      </Row>
    ) : (
      <>
        <Col md={desktopDisplay ? '8' : ''} className={desktopDisplay ? 'mr-5' : ''}>
          <Label className={`mr-1 ${darkMode ? 'text-light' : ''}`}>
            {userProfile.endDate
              ? 'End Date ' + userProfile.endDate.substring(0, 10)
              : 'End Date ' + 'N/A'}
          </Label>
          {canEdit && canEditEndDate && !desktopDisplay && (
            <SetUpFinalDayButton
              loadUserProfile={loadUserProfile}
              setUserProfile={setUserProfile}
              isBigBtn={true}
              userProfile={userProfile}
              darkMode={darkMode}
            />
          )}
        </Col>
        {desktopDisplay && canEdit && canEditEndDate && (
          <Col>
            <SetUpFinalDayButton
              loadUserProfile={loadUserProfile}
              setUserProfile={setUserProfile}
              isBigBtn={true}
              userProfile={userProfile}
              darkMode={darkMode}
              onFinalDaySave={(updatedUser) => {
                setUserProfile(updatedUser);
                loadUserProfile();
              }}
            />
          </Col>
        )}
      </>
    )}
  </>
);

  const statusComponent = (
    <>
      {desktopDisplay ? (
        <Row
          style={{
            display: 'flex',
            alignItems: 'center', // Ensures vertical alignment of all items
            justifyContent: 'space-between', // Space between the columns
          }}
        >
          <Col
            md="2"
            className="mr-5"
            style={{
              display: 'flex',
              alignItems: 'center', // Align label vertically
            }}
          >
            <Label className={darkMode ? 'text-light' : ''} style={{ margin: '0' }}>
              Status
            </Label>
          </Col>

          <Col
            style={{
              display: 'flex',
              alignItems: 'center', // Align label and button vertically
              justifyContent: 'flex-end', // Align button to the far right
            }}
          >
            <Label
              style={{ margin: '0' }}
              className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}
            >
              {userProfile.isActive
                ? 'Active'
                : userProfile.reactivationDate
                ? 'Paused until ' + formatDateLocal(userProfile.reactivationDate)
                : 'Inactive'}
            </Label>
            &nbsp;
            {canEdit && canEditStatus && (
              <PauseAndResumeButton
                setUserProfile={setUserProfile}
                loadUserProfile={loadUserProfile}
                isBigBtn={true}
                userProfile={userProfile}
                darkMode={darkMode}
              />
            )}
          </Col>
        </Row>
      ) : (
        // Non-desktop view
        <>
          <Col>
            <Label className={darkMode ? 'text-light' : ''}>Status</Label>
            <div>
              <Label style={{ fontWeight: 'normal' }} className={darkMode ? 'text-light' : ''}>
                {userProfile.isActive
                  ? 'Active'
                  : userProfile.reactivationDate
                  ? 'Paused until ' + formatDateLocal(userProfile.reactivationDate)
                  : 'Inactive'}
              </Label>
              &nbsp;
              {canEdit && canEditStatus && (
                <PauseAndResumeButton
                  setUserProfile={setUserProfile}
                  loadUserProfile={loadUserProfile}
                  isBigBtn={true}
                  userProfile={userProfile}
                  darkMode={darkMode}
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
    <div className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
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
            <Row style={{ marginBottom: '10px' }}>{roleComponent}</Row>
            <Row style={{  marginBottom: '10px' }}>
              {locationComponent}
              <Col md="1"></Col>
            </Row>
            <Row style={{ marginTop: '15px', marginBottom: '10px' }}>
              {timeZoneComponent}
              <Col md="1"></Col>
            </Row>
            <Row>{timeZoneDifferenceComponent}</Row>
            <Row className='custom-row' style={{ marginBottom: '10px' }}>{statusComponent}</Row>
            <Row className='custom-row' style={{ marginBottom: '10px' }}>{endDateComponent}</Row>
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
