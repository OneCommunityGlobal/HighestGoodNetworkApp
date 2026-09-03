import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import { Button, Col, FormFeedback, FormGroup, Input, Label, Row } from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';

//// import 'react-phone-input-2/lib/style.css';
import axios from 'axios';
import { isString } from 'lodash';
import { connect, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import PauseAndResumeButton from '~/components/UserManagement/PauseAndResumeButton';
import SetUpFinalDayButton from '~/components/UserManagement/SetUpFinalDayButton';
import EditableInfoModal from '~/components/UserProfile/EditableModal/EditableInfoModal';
import { boxStyle, boxStyleDark } from '~/styles';
import { formatDateCompany, formatDateLocal } from '~/utils/formatDate';
import hasPermission from '~/utils/permissions';
import { ENDPOINTS } from '~/utils/URL';
import TimeZoneDropDown from '../TimeZoneDropDown';
import styles from './BasicInformationTab.module.css';
import RoleChangePermissionsModal from '~/components/UserProfile/RoleChangePermissionsModal';


export const Name = props => {
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
        <Col md={desktopDisplay ? '3' : ''} style={{paddingRight: 0}} className={darkMode ? 'bg-yinmn-blue' : ''}>
          <FormGroup>
            <div style={{position: 'relative'}}>
            <Input
              type="text"
              name="firstName"
              id="firstName"

              data-testid='firstName'

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
        <Col md={desktopDisplay ? '3' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
          <FormGroup>
          <div style={{position: 'relative'}}>
            <Input
              type="text"
              name="lastName"
              id="lastName"
              data-testid='lastName'
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
      <Col className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{`${firstName} ${lastName}`}</p>
      </Col>
    </>
  );
};

  export const Title = props => {
  const { userProfile, setUserProfile, canEdit, desktopDisplay, darkMode } = props;
  const { jobTitle } = userProfile;

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
          <FormGroup>
            <div style={{position: 'relative', width: '100%'}}>
            <Input
              type="text"
              name="title"
              id="jobTitle"
              data-testid="jobTitle"
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
      <Col className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{`${jobTitle}`}</p>
      </Col>
    </>
  );
};


export const Email = props => {
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
        <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
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
              id="emailPrivacy"
              state={privacySettings?.email}
              handleUserProfile={props.handleUserProfile}
              darkMode={darkMode}
            />

            <ToggleSwitch
              switchType="email-subcription"

              id="emailSubscription"
              state={emailSubscriptions? emailSubscriptions : false}

              // state={emailSubscriptions ? emailSubscriptions : false}

              handleUserProfile={props.handleUserProfile}
              darkMode={darkMode}
            />

            <Input
              type="email"
              name="email"
              id="email"
              data-testid="email"
              value={email}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
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
        <Col className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{email}</p>
        </Col>
      )}
    </>
  );
};

export const formatPhoneNumber = str => {
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

export const Phone = props => {
  const { userProfile, setUserProfile, handleUserProfile, canEdit, desktopDisplay, darkMode } = props;
  const { phoneNumber, privacySettings } = userProfile;
  const phoneInputWrapperRef = useRef(null);

  if (canEdit) {
    return (
      <>
        <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
          <FormGroup>
            {/* one toggle, same as Email */}
            <ToggleSwitch
              switchType="phone"
              id="phone"
              state={privacySettings?.phoneNumber}
              handleUserProfile={handleUserProfile}
              darkMode={darkMode}
            />

            {/* wrapper to position the copy icon correctly */}
            <div
              ref={phoneInputWrapperRef}
              style={{ position: 'relative', width: '100%' }}
            >
              <PhoneInput
                buttonClass={`${darkMode ? 'bg-darkmode-liblack' : ''}`}
                inputClass={`phone-input-style ${
                  darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''
                }`}
                country="us"
                data-testid="ph-input-style"
                id="ph-input-style"
                value={phoneNumber}
                onChange={value => {
                  setUserProfile({ ...userProfile, phoneNumber: value.trim() });
                }}
              />

              <FontAwesomeIcon
                icon={faCopy}
                title="Copy phone number"
                onClick={() => {
                  const input = phoneInputWrapperRef.current?.querySelector('input');
                  if (input) {
                    navigator.clipboard.writeText(input.value);
                    toast.success('Phone number copied!');
                  }
                }}
                style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: darkMode ? '#fff' : '#000',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
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
      {privacySettings?.phoneNumber && (
        <Col className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>
            {formatPhoneNumber(phoneNumber)}
          </p>
        </Col>
      )}
    </>
  );
};

export const TimeZoneDifference = props => {
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
        <Col md="6" className={darkMode ? 'bg-yinmn-blue' : ''}>
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{signedOffset} hours</p>
        </Col>
      </>
    );
  }

  return (
    <>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
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
    hasFinalDay,
  } = props;
  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [desktopDisplay, setDesktopDisplay] = useState(window.innerWidth > 1024);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [showRolePermsModal, setShowRolePermsModal] = useState(false);
  const [newRole, setNewRole] = useState(userProfile.role);
  const dispatch = useDispatch();
  const rolesAllowedToEditStatusFinalDay = ['Administrator', 'Owner'];
  const canEditStatus = dispatch(hasPermission('interactWithPauseUserButton'));

  const canEditEndDate =
  rolesAllowedToEditStatusFinalDay.includes(role) || dispatch(hasPermission('setFinalDay'));


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
      // eslint-disable-next-line no-alert
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

  const updateSelectedRole = selectedRole => {
    setNewRole(selectedRole);
    const retrievedRole = roles.find(role => role.roleName === selectedRole);
    const remainingAddedPermissions = userProfile.permissions.frontPermissions.some(permission => !retrievedRole.permissions.includes(permission));
    const remainingRemovedPermissions = retrievedRole.permissions.some(permission => userProfile.permissions.removedDefaultPermissions.includes(permission));

    if(remainingAddedPermissions || remainingRemovedPermissions) {
      setShowRolePermsModal(true)
    } else {
      setUserProfile({ 
        ...userProfile, 
        role: selectedRole,
      })
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const nameComponent = (
    <>
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <span className={styles['label-icon-container']}>
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
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <span className={styles['label-icon-container']}>
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
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <span className={styles['label-icon-container']}>
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
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <span className={styles['label-icon-container']}>
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
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <Label className={darkMode ? 'text-light' : ''}>Video Call Preference</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
        {canEdit ? (
          <FormGroup disabled={!canEdit}>
            <Input
              type="text"
              name="collaborationPreference"
              id="collaborationPreference"
              data-testid="collaborationPreference"
              value={userProfile.collaborationPreference}
              className={`${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              onChange={e => {
                setUserProfile({ ...userProfile, collaborationPreference: e.target.value });
              }}
              placeholder="Skype, Zoom, etc."
            />
          </FormGroup>
        ) : (
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{userProfile.collaborationPreference}</p>
        )}
      </Col>
    </>
  );

  const roleComponent = (
    <>
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <Label className={darkMode ? 'text-light' : ''}>Role</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
        {canEditRole ? (
          <FormGroup>
            <select
              id="role"
              name="role"
              className={`form-control ${darkMode ? 'bg-darkmode-liblack border-0 text-light' : ''}`}
              value={newRole || ''}   // make sure this is a string
              onChange={e => {
                updateSelectedRole(e.target.value)
              }}
            >
              {/* Optional placeholder when no role selected */}
              {!userProfile.role && <option value="">Select role</option>}

              {canAddDeleteEditOwners && (
                <option value="Owner" style={desktopDisplay ? { marginLeft: '5px' } : {}}>
                  Owner
                </option>
              )}
  
              {(roles || [])
                .map(r => (typeof r === 'string' ? r : r.roleName)) // normalize
                .filter(Boolean)
                .map(roleName => {
                  if (roleName === 'Owner') return null; // skip Owner in this list
                  return (
                    <option key={roleName} value={roleName}>
                      {roleName}
                    </option>
                  );
                })}
            </select>
          </FormGroup>
          
        ) : (
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{userProfile.role}</p>
        )}
      </Col>
      {desktopDisplay ? (
        <Col md="1">
          <div style={{ marginTop: topMargin }}>
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
          <Col md={{ size: 5, offset: 0 }} className={darkMode ? styles['dark-label-col'] : ''}>
            <Label className={darkMode ? 'text-light' : ''}>Location</Label>
          </Col>
          {desktopDisplay ? (
            <Col md="6" style={{paddingRight: 0}} className={darkMode ? 'bg-yinmn-blue' : ''}>
              <Row className="ml-0">
                <Col className="p-0">
                  <Input
                    data-testid="location"
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
            <Col className={styles['cols']}>
              <Input data-testid="location" onChange={handleLocation} value={userProfile.location.userProvided || ''} />
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
      <Col md="5" className={darkMode ? styles['dark-label-col'] : ''}>
        <Label className={darkMode ? 'text-light' : ''}>Time Zone</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{userProfile.timeZone}</p>
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
      <Col md={desktopDisplay ? '5' : ''} className={darkMode ? styles['dark-label-col'] : ''}>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
  const statusComponent = (
    <>
      <Col md={desktopDisplay ? '5' : ''} className={darkMode ? styles['dark-label-col'] : ''}>
        <Label className={darkMode ? 'text-light' : ''}>
          Status
        </Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className={`${darkMode ? 'text-light' : ''}`} style={{ margin: '0', flex: 1 }}>
            {(() => {
              if (userProfile.isActive) return 'Active';
              if (userProfile.reactivationDate) return 'Paused until ' + formatDateCompany(userProfile.reactivationDate);
              return 'Inactive';
            })()}
          </p>
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
    </>
  );

  const endDateComponent = (
    <>
      <Col md={desktopDisplay ? '5' : ''} className={darkMode ? styles['dark-label-col'] : ''}>
        <Label className={darkMode ? 'text-light' : ''}>
          End Date
        </Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''} className={darkMode ? 'bg-yinmn-blue' : ''}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className={`${darkMode ? 'text-light' : ''}`} style={{ margin: '0', flex: 1 }}>
            {userProfile.endDate ? formatDateLocal(userProfile.endDate) : 'N/A'}
          </p>
          {canEdit && canEditEndDate && (
            <SetUpFinalDayButton
              loadUserProfile={loadUserProfile}
              setUserProfile={setUserProfile}
              isBigBtn={true}
              userProfile={userProfile}
              darkMode={darkMode}
              hasFinalDay={hasFinalDay}
            />
          )}
        </div>
      </Col>
    </>
  );

  const statusComponentMobile = (
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
  );

  const endDateComponentMobile = (
    <Col>
      <Label className={darkMode ? 'text-light' : ''}>End Date</Label>
      <div>
        <Label style={{ fontWeight: 'normal' }} className={darkMode ? 'text-light' : ''}>
          {userProfile.endDate
            ? formatDateLocal(userProfile.endDate)
            : 'N/A'}
        </Label>
        &nbsp;
        {canEdit && canEditEndDate && (
          <SetUpFinalDayButton
            loadUserProfile={loadUserProfile}
            setUserProfile={setUserProfile}
            isBigBtn={true}
            userProfile={userProfile}
            darkMode={darkMode}
          />
        )}
      </div>
    </Col>
  );

  return (
    <div className={darkMode ? 'bg-yinmn-blue text-light' : ''}>
      <div
        data-testid="basic-info-tab"
        className={`${desktopDisplay ? styles['basic-info-tab-desktop'] : styles['basic-info-tab-tablet']} ${darkMode ? `bg-yinmn-blue ${styles['dark-mode']}` : ''}`}
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
            <Row>
              {roleComponent}
              <Col md="1" lg="1"></Col>
            </Row>
            <Row>
              {locationComponent}
              <Col md="1"></Col>
            </Row>
            <Row>
              {timeZoneComponent}
              <Col md="1"></Col>
            </Row>
            <Row>{timeZoneDifferenceComponent}<Col md="1"></Col></Row>
            <Row>{statusComponent}<Col md="1"></Col></Row>
            <Row>{endDateComponent}<Col md="1"></Col></Row>
          </>
        ) : (
          <>
            <Col className={styles['cols']}>{nameComponent}</Col>
            <Col className={styles['cols']}>{titleComponent}</Col>
            <Col className={styles['cols']}>{emailComponent}</Col>
            <Col className={styles['cols']}>{phoneComponent}</Col>
            <Col className={styles['cols']}>{videoCallPreferenceComponent}</Col>
            <Col className={styles['cols']}>{roleComponent}</Col>
            <Col className={styles['cols']}>{locationComponent}</Col>
            <Col className={styles['cols']}>{timeZoneComponent}</Col>
            <Col className={styles['cols']}>{timeZoneDifferenceComponent}</Col>
            <hr />
            <Row xs="2" style={{ marginLeft: '1rem' }}>
              {statusComponentMobile}
            </Row>
            <Row xs="2" style={{ marginLeft: '1rem' }}>
              {endDateComponentMobile}
            </Row>
          </>
        )}
      </div>
      <RoleChangePermissionsModal
        isOpen={showRolePermsModal}
        onClose={() => setShowRolePermsModal(false)}
        newRole={newRole}
        roles={roles}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        loadUserProfile={loadUserProfile}
        desktopDisplay={desktopDisplay}
        canAddDeleteEditOwners={canAddDeleteEditOwners}
      />
    </div>
  );
};

BasicInformationTab.propTypes = {
  userProfile: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    jobTitle: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    collaborationPreference: PropTypes.string,
    role: PropTypes.string,
    location: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        userProvided: PropTypes.string,
        coords: PropTypes.shape({
          lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          lng: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
        country: PropTypes.string,
        city: PropTypes.string,
      }),
    ]),
    timeZone: PropTypes.string,
    isActive: PropTypes.bool,
    reactivationDate: PropTypes.string,
    endDate: PropTypes.string,
    privacySettings: PropTypes.shape({
      email: PropTypes.bool,
      phoneNumber: PropTypes.bool,
    }),
    emailSubscriptions: PropTypes.bool,
    permissions: PropTypes.shape({
      frontPermissions: PropTypes.array,
    }),
  }).isRequired,
  setUserProfile: PropTypes.func.isRequired,
  isUserSelf: PropTypes.bool,
  handleUserProfile: PropTypes.func.isRequired,
  formValid: PropTypes.shape({
    firstName: PropTypes.bool,
    lastName: PropTypes.bool,
    email: PropTypes.bool,
  }).isRequired,
  setFormValid: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  canEditRole: PropTypes.bool,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      roleName: PropTypes.string,
    })
  ),
  role: PropTypes.string,
  loadUserProfile: PropTypes.func.isRequired,
  darkMode: PropTypes.bool,
  hasPermission: PropTypes.func.isRequired,
};
Name.propTypes = {
  userProfile: PropTypes.object.isRequired,
  setUserProfile: PropTypes.func.isRequired,
  formValid: PropTypes.object.isRequired,
  setFormValid: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  desktopDisplay: PropTypes.bool,
  darkMode: PropTypes.bool,
};

Email.propTypes = {
  userProfile: PropTypes.object.isRequired,
  setUserProfile: PropTypes.func.isRequired,
  formValid: PropTypes.object.isRequired,
  setFormValid: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  desktopDisplay: PropTypes.bool,
  darkMode: PropTypes.bool,
  handleUserProfile: PropTypes.func.isRequired,
};

Phone.propTypes = {
  userProfile: PropTypes.object.isRequired,
  setUserProfile: PropTypes.func.isRequired,
  handleUserProfile: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  desktopDisplay: PropTypes.bool,
  darkMode: PropTypes.bool,
};

export default connect(null, { hasPermission })(BasicInformationTab);
