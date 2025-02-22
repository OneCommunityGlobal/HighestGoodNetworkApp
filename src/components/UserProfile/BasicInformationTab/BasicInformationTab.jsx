import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Row, Label, Input, Col, FormFeedback, FormGroup, Button } from 'reactstrap';
import ToggleSwitch from '../UserProfileEdit/ToggleSwitch';
import moment from 'moment';
import PhoneInput from 'react-phone-input-2';
// import 'react-phone-input-2/lib/style.css';
import PauseAndResumeButton from 'components/UserManagement/PauseAndResumeButton';
import TimeZoneDropDown from '../TimeZoneDropDown';
import { connect, useDispatch, useSelector } from 'react-redux';
import hasPermission from 'utils/permissions';
import SetUpFinalDayButton from 'components/UserManagement/SetUpFinalDayButton';
import styles from './BasicInformationTab.css';
import { boxStyle, boxStyleDark } from 'styles';
import EditableInfoModal from 'components/UserProfile/EditableModal/EditableInfoModal';
import { formatDateLocal } from 'utils/formatDate';
import { ENDPOINTS } from 'utils/URL';
import axios from 'axios';
import { isString } from 'lodash';
import { toast } from 'react-toastify';
import PermissionChangeModal from '../UserProfileModal/PermissionChangeModal';
import { updateUserProfileProperty } from '../../../actions/userProfile';
import permissionLabels from 'components/PermissionsManagement/PermissionsConst';
import { permissionPresets } from '../UserProfileModal/PermissionPresetsTemp';
import { getPresetsByRole } from '../../../actions/rolePermissionPresets';
import PermissionList from 'components/PermissionsManagement/PermissionList';
import { PermissionsContext } from 'components/PermissionsManagement/PermissionsContext';
import { PermissionsProvider } from 'components/PermissionsManagement/PermissionsContext';

const Name = props => {
  const { userProfile, setUserProfile, formValid, setFormValid, canEdit, desktopDisplay, darkMode } = props;

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
                setFormValid({ ...formValid, lastName: !!e.target.value && e.target.value.trim().length >=2 });
              }}
              placeholder="Last Name"
              invalid={!formValid.lastName}
            />
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
        <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{`${jobTitle}`}</p>
      </Col>
    </>
  );
};

const Email = props => {
  const { userProfile, setUserProfile, formValid, setFormValid, canEdit, desktopDisplay, darkMode } = props;

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
              darkMode={darkMode}
            />

            <ToggleSwitch
              switchType="email-subcription"
              state={emailSubscriptions ? emailSubscriptions : false}
              handleUserProfile={props.handleUserProfile}
              darkMode={darkMode}
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
  const { userProfile, setUserProfile, handleUserProfile, canEdit, desktopDisplay, darkMode } = props;
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
              darkMode={darkMode}
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
          <p className={`text-right ${darkMode ? 'text-light' : ''}`}>{formatPhoneNumber(phoneNumber)}</p>
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
        <p className={`${darkMode ? 'text-light' : ''} ${desktopDisplay ? 'text-right' : 'text-left'}`}>This is your own profile page</p>
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
    darkMode
  } = props;
  const [timeZoneFilter, setTimeZoneFilter] = useState('');
  const [desktopDisplay, setDesktopDisplay] = useState(window.innerWidth > 1024);
  const [errorOccurred, setErrorOccurred] = useState(false);
  const [oldRole, setOldRole] = useState(userProfile.role);
  const [oldRolePermissions, setOldRolePermissions] = useState([]);
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  // const [currentUserPermissions, setCurrentUserPermissions] = useState([]);
  const [immutablePermissions, setImmutablePermissions] = useState([]);
  const [currentUserPermissionsWithHasPermission, setCurrentUserPermissionsWithHasPermission] = useState([]);

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
        const { timezone, currentLocation } = res.data;
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

  const { 
    currentUserPermissions, 
    setCurrentUserPermissions, 
    getCurrentUserPermissions, 
    permissionLabelPermissions,
  } = useContext(PermissionsContext);
  const dispatch = useDispatch();

  /* useEffect(() => {
    console.log('BasicInformationTab currentUserPermissions:', currentUserPermissions); // Log state updates
  }, [currentUserPermissions]); */

  /* useEffect(() => {
    let isMounted = true;
    
    const getPermissions = async () => {
      if (userProfile && userProfile.role) {
      // console.log('Fetching current user permissions');
      const permissions = await getCurrentUserPermissions(permissionLabels);
      if (isMounted) {
        // console.log('Fetched current user permissions:', permissions);
        setCurrentUserPermissions(permissions);
      }
    }
    };

    getPermissions();

    return () => {
      isMounted = false;
    };
  }, [permissionLabels, userProfile?.role, getCurrentUserPermissions]); */

  /* if (!userProfile) {
    return <div>Loading...</div>;
  } */

  // const rolePermissions = useSelector(state => state.role.rolePermissions) || [];
  // const immutablePermissions = useSelector(state => state.role.immutablePermissions) || [];

  /* useEffect(() => {
    console.log('rolePermissions:', rolePermissions);
    console.log('immutablePermissions:', immutablePermissions);
  }, [rolePermissions, immutablePermissions]); */

  useEffect(() => {
    // console.log('immutablePermissions:', immutablePermissions);
  }, [immutablePermissions]);

  const fetchPresetsByRole = useCallback(async (roleName) => {
    // console.log('Fetching presets for role:', roleName);
    try {
      const response = await dispatch(getPresetsByRole(roleName));
      const presets = response.presets || [];
      // console.log('Fetched presets:', JSON.stringify(presets, null, 2));
      
      const rolePresets = presets.find(preset => preset.roleName === roleName)?.permissions || [];
      // console.log('Role presets for', roleName, ':', rolePresets);
      
      // make sure that the permissions are in the permissionLabelPermissions array and there are no duplicates
      const uniquePermissions = new Set(rolePresets.filter(permission => permissionLabelPermissions.has(permission)));
      
      let additionalPermissions = [];
      let permissionsToRemove = [];

      switch (roleName) {
        case 'Administrator':
          additionalPermissions = [
            'resolveTask', 
            'putRole',
            // testing these
            // 'suggestTask',
            // 'putReviewStatus',
            'editTitle',
            // 'highlightEligibleBios'
          ];
          break;
        case 'Manager':
          additionalPermissions = [
            'getUserProfiles', 
            'putUserProfile', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'getProjectMembers',
            // testing these
            'deleteTask',
            'resolveTask',
            // temporary for testing
            'putRole',
            'putUserProfilePermissions'
          ];
          break;
        case 'Mentor':
          additionalPermissions = [
            'getUserProfiles', 
            'putUserProfile', 
            'addInfringements', 
            'editInfringements', 
            'deleteInfringements', 
            'getProjectMembers',
            'updateTask',
            // 'postTask',
            // 'putTeam',
            // temporary for testing
            'putRole'
          ];
          break;
        case 'Core Team':
          additionalPermissions = [
            // 'addInfringements', 
            // 'editInfringements', 
            // 'deleteInfringements', 
            // 'postTask', 
            // 'updateTask', 
            // 'suggestTask', 
            // 'putReviewStatus', 
            // 'putTeam',
            // temporary for testing
            'putRole', 
            'putUserProfile'
          ];
          break;
        case 'TestRole':
          additionalPermissions = [
            'seeUsersInDashboard', 
            'editHeaderMessage', 
            'getReports', 
            'getWeeklySummaries', 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'getVolunteerWeeklySummary',  
            'changeUserStatus',  
            'putRole', 
            'putUserProfilePermissions',
            // the following nine should only be needed if hasPermission viewingUser is false
            // 'addInfringements', 
            // 'editInfringements', 
            // 'deleteInfringements', 
            // 'getProjectMembers', 
            // 'postTask', 
            // 'updateTask', 
            // 'suggestTask', 
            // 'putReviewStatus', 
            // 'putTeam',
            // temporary for testing
            'getUserProfiles', 
            'putUserProfile'
          ];
          break;
        case 'usethistotest':
          additionalPermissions = [ 
            'totalValidWeeklySummaries', 
            'highlightEligibleBios', 
            'postUserProfile',
            'updateBadges', 
            'deleteBadges',
            // the following 10 should only be needed if hasPermission viewingUser is false
            // 'getUserProfiles', 
            // 'addInfringements', 
            // 'editInfringements', 
            // 'deleteInfringements', 
            // 'getProjectMembers', 
            // 'postTask', 
            // 'updateTask', 
            // 'suggestTask', 
            // 'putReviewStatus', 
            // 'putTeam',
            // temporary for testing
            'putUserProfile',
            'putRole',
          ];
          break;
        case 'Creator':
          // temporary for testing
          additionalPermissions = ['putRole', 'putUserProfile'];
          permissionsToRemove = [
            'postUserProfile', 
            'deleteInfringements', 
            'createBadges', 
            'getProjectMembers', 
            'editHeaderMessage', 
            'highlightEligibleBios'
          ];
          break;
        case 'Assistant Manager':
          additionalPermissions = [ 
            // 'seeUsersInDashboard', 
            // 'getReports',
            // temporary for testing
            'putUserProfile',
            'putRole',
          ];
          break;
        case 'Volunteer':
          additionalPermissions = [ 
            // testing these
            'editTeamCode',
            // 'putReviewStatus',
            // temporary for testing
            'putUserProfile',
            'putRole',
          ];
          break;
        case 'General':
          additionalPermissions = [
            'seeUsersInDashboard', 
            'editHeaderMessage', 
            'putUserProfile', 
            // the following 3 should only be needed if hasPermission viewingUser is false
            // 'editTeamCode', 
            // 'suggestTask', 
            // 'putReviewStatus', 
            'putRole'
          ];
          break;
        // Add cases for other roles as needed
        default:
          additionalPermissions = [];
      }
      const derivedPermissions = roleName === 'Creator'
        ? Array.from(new Set([...uniquePermissions, ...additionalPermissions]))
          .filter(permission => !permissionsToRemove.includes(permission))
        : Array.from(new Set([...uniquePermissions, ...additionalPermissions]));
      console.log('Derived permissions for role:', roleName, derivedPermissions);

      return derivedPermissions;
    } catch (error) {
      console.error('Error fetching presets for role:', error);
      toast.error(`Failed to fetch presets for role: ${roleName}`);
      return [];
    }
  }, [dispatch, permissionLabelPermissions]);

  useEffect(() => {    
    const fetchOldRolePresets = async () => {
      const validOldRolePermissions = await fetchPresetsByRole(oldRole);
      console.log('Fetched old role presets:', validOldRolePermissions);
      setOldRolePermissions(validOldRolePermissions);
    };

    fetchOldRolePresets();
  }, [fetchPresetsByRole, oldRole, userProfile.role, permissionPresets, permissionLabelPermissions]);

  useEffect(() => {
    const fetchNewRolePresets = async () => {
      const validNewRolePermissions = await fetchPresetsByRole(newRole);
      console.log('Fetched new role presets:', validNewRolePermissions);
      setNewRolePermissions(validNewRolePermissions);
    };

    if (newRole) {
      fetchNewRolePresets();
    }
  }, [fetchPresetsByRole, newRole, permissionPresets, userProfile.role]);

  // difference between old role permissions and user permissions
  // permissions that were added to user (user permissions - old role permissions)
  const customAddedPermissions = useMemo(() => {
    return Array.isArray(currentUserPermissions) ? currentUserPermissions.filter(permission => !oldRolePermissions.includes(permission)) : [];
  }, [currentUserPermissions, oldRolePermissions]);
  // permissions that were removed from user (old role permissions - user permissions)
  const customRemovedPermissions = useMemo(() => {
    return Array.isArray(oldRolePermissions) ? oldRolePermissions.filter(permission => !currentUserPermissions.includes(permission)) : [];
  }, [oldRolePermissions, currentUserPermissions]);
  // permissions that were removed from user but are in new role (newRolePermissions - customRemovedPermissions)
  const newRolePermissionsToAdd = useMemo(() => {
    return Array.isArray(newRolePermissions) ? newRolePermissions.filter(permission => customRemovedPermissions.includes(permission)) : [];
  }, [newRolePermissions, customRemovedPermissions]);
  // permissions that were added to user but are not in new role (newRolePermissions + customAddedPermissions)
  const newRolePermissionsToRemove = useMemo(() => {
    return Array.isArray(customAddedPermissions) ? customAddedPermissions.filter(permission => !newRolePermissions.includes(permission)) : [];
  }, [customAddedPermissions, newRolePermissions]);

  useEffect(() => {
    // console.log('user profile:', userProfile);
    // console.log('user profile:', JSON.stringify(userProfile, null, 2));
    console.log('currentUserPermissions:', currentUserPermissions);
    // console.log('oldRole:', oldRole);
    console.log('oldRolePermissions:', oldRolePermissions);
    console.log('newRolePermissions:', newRolePermissions);
    // console.log('customAddedPermissions:', customAddedPermissions);
    // console.log('customRemovedPermissions:', customRemovedPermissions);
    // console.log('newRolePermissionsToAdd:', newRolePermissionsToAdd);
    // console.log('newRolePermissionsToRemove:', newRolePermissionsToRemove);
    // console.log('userprofile permissions:', userProfile.permissions);

    // Compare the arrays and log the differences
    const compareArrays = (arr1, arr2) => {
      const onlyInArr1 = arr1.filter(item => !arr2.includes(item));
      const onlyInArr2 = arr2.filter(item => !arr1.includes(item));
      return { onlyInArr1, onlyInArr2 };
    };

    const differences = compareArrays(oldRolePermissions, currentUserPermissions);
    console.log('Permissions only in oldRolePermissions:', differences.onlyInArr1);
    console.log('Permissions only in currentUserPermissions:', differences.onlyInArr2);
  }, [oldRole, newRolePermissions, customAddedPermissions, customRemovedPermissions, newRolePermissionsToAdd, newRolePermissionsToRemove]);

  const openPermissionModal = () => setPermissionModalOpen(true);
  const closePermissionModal = () => setPermissionModalOpen(false);

  const handleRoleChange = async (e) => {
    const chosenRole = e.target.value;

    // Fetch old role permissions before changing the role
    const validOldRolePermissions = await fetchPresetsByRole(oldRole);
    setOldRolePermissions(validOldRolePermissions);

    setNewRole(chosenRole);

    // Fetch new role permissions before evaluating conditions
    const validNewRolePermissions = await fetchPresetsByRole(chosenRole);
    setNewRolePermissions(validNewRolePermissions);

    console.log('oldRolePermissions:', validOldRolePermissions);
    console.log('currentUserPermissions:', currentUserPermissions);

    const permissionsDifferent =
      oldRolePermissions.some((permission) => !currentUserPermissions.includes(permission)) ||
      currentUserPermissions.some((permission) => !oldRolePermissions.includes(permission));

    // console.log('permissionsDifferent: ', permissionsDifferent);
    // console.log('newRolePermissionsToAdd:', newRolePermissionsToAdd);
    // console.log('newRolePermissionsToRemove:', newRolePermissionsToRemove);
    
    if (permissionsDifferent && (newRolePermissionsToAdd.length > 0 || newRolePermissionsToRemove.length > 0)) {
      openPermissionModal();
    } else {
      try {
        const response = await dispatch(updateUserProfileProperty(userProfile, 'role', chosenRole));
        // await dispatch(updateUserProfileProperty(userProfile, 'permissions', []));

        if (response === 200) {
          setUserProfile({ 
            ...userProfile, 
            role: chosenRole,
            permissions: {
              ...userProfile.permissions,
              frontPermissions: validNewRolePermissions
            }
          });
          
          setOldRole(chosenRole);
          const confirmedOldRolePermissions = await fetchPresetsByRole(oldRole);
          setOldRolePermissions(confirmedOldRolePermissions);
          
          toast.success('User role successfully updated');
        }

        // Update currentUserPermissions after role change
        /* const updatedPermissions = await getCurrentUserPermissions(permissionLabels);
        setCurrentUserPermissions(updatedPermissions); */
        setCurrentUserPermissions(newRolePermissions);
        console.log('newRolePermissions:', newRolePermissions);
        console.log('Updated currentUserPermissions:', currentUserPermissions);

      } catch (error) {
        console.error('Error updating role:', error);
        toast.error('Failed to update role');
      }
    }
  };

  /* const handlePermissionsChange = async () => {
    const updatedPermissions = await getCurrentUserPermissions(permissionLabels);
    setCurrentUserPermissions(updatedPermissions);
  }; */

  const handlePermissionsChange = (updatedPermissions) => {
    // console.log('handlePermissionsChange called with:', updatedPermissions);
    setCurrentUserPermissions(updatedPermissions);
  };

  const getPermissionsWithHasPermission = useCallback(async () => {
    let testPerms = [];
    for (let permission of permissionLabelPermissions) {
      const hasPerm = await dispatch(hasPermission(permission, true, userProfile.role));
      if (hasPerm && !testPerms.includes(permission)) {
        testPerms.push(permission);
      }
    }
    // return testPerms;
    // Add 'putRole', 'putUserProfile', and 'putUserProfilePermissions' permissions for testing purposes
    const updatedPermissions = [...new Set([...testPerms, 'putRole', 'putUserProfile', 'putUserProfilePermissions'])];
    return updatedPermissions;
  }, [dispatch, permissionLabelPermissions, userProfile.role]);
  
  useEffect(() => {
    const fetchPermissions = async () => {
      const permissions = await getPermissionsWithHasPermission();
      console.log('Fetched permissions:', permissions);
      setCurrentUserPermissionsWithHasPermission(permissions);
    };
  
    fetchPermissions();
  }, [getPermissionsWithHasPermission]);

  useEffect(() => {
    console.log('currentUserPermissionsWithHasPermission:', currentUserPermissionsWithHasPermission);
  }, [currentUserPermissionsWithHasPermission]);

  useEffect(() => {
    let isMounted = true;
    
    const getPermissions = async () => {
      if (userProfile && userProfile.role) {
        const permissions = await getPermissionsWithHasPermission();
        if (isMounted) {
          console.log('Fetched current user permissions:', permissions);
          setCurrentUserPermissions(permissions);
        }
      }
    };

    getPermissions();

    return () => {
      isMounted = false;
    };
  }, [userProfile?.role, getPermissionsWithHasPermission]);

  const nameComponent = (
    <>
      <Col>
        <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>Name</Label>
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
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const titleComponent = (
    <>
      <Col>
        <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>Title</Label>
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
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const emailComponent = (
    <>
      <Col>
        <Label className={darkMode ? 'text-light label-with-icon' : ' label-with-icon'}>Email</Label>
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
        darkMode={darkMode}
        desktopDisplay={desktopDisplay}
      />
    </>
  );

  const phoneComponent = (
    <>
      <Col>
        <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>Phone</Label>
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
      <PermissionsProvider userProfile={userProfile}>
        <PermissionChangeModal 
          userProfile={userProfile} 
          setUserProfile={setUserProfile}
          isOpen={isPermissionModalOpen}
          closeModal={closePermissionModal}
          newRole={newRole}
          oldRolePermissions={oldRolePermissions}
          newRolePermissions={newRolePermissions}
          currentUserPermissions={currentUserPermissions}
          setCurrentUserPermissions={setCurrentUserPermissions}
          permissionLabelPermissions={permissionLabelPermissions}
          permissionPresets={permissionPresets}
          newRolePermissionsToAdd={newRolePermissionsToAdd}
          newRolePermissionsToRemove={newRolePermissionsToRemove}
          setOldRole={setOldRole}
          getCurrentUserPermissions={getCurrentUserPermissions}
          onPermissionsChange={handlePermissionsChange}
        />
      {/* <PermissionList
        rolePermissions={currentUserPermissions}
        permissionsList={permissionLabels}
        immutablePermissions={immutablePermissions}
        editable={true}
        setPermissions={setCurrentUserPermissions}
        onChange={handlePermissionsChange}
        darkMode={darkMode}
      /> */}
      <Col>
        <Label className={darkMode ? 'text-light' : ''}>Role</Label>
      </Col>
      <Col md={desktopDisplay ? '6' : ''}>
        {canEditRole ? (
          <FormGroup>
            <select
              value={userProfile.role}
              onChange={handleRoleChange}
              /* onChange={(e) => {
                const permissionsDifferent = 
                  oldRolePermissions.some(permission => 
                    !currentUserPermissions.includes(permission)) || 
                  currentUserPermissions.some(permission => 
                    !oldRolePermissions.includes(permission))
                ;
                
                if (permissionsDifferent) {
                  openPermissionModal();
                  setPotentialRole(e.target.value);
                } else {
                  setUserProfile({
                    ...userProfile,
                    role: e.target.value,
                    permissions: { ...userProfile.permissions, frontPermissions: [] },
                  });
                  console.log('userProfile: ', userProfile); 
                }              
              }} */
              // /* onChange={(e) => {
                // openPermissionModal();
                // setPotentialRole(e.target.value);
              // }} */
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
            <EditableInfoModal role={role} areaName={'roleInfo'} areaTitle="Roles" fontSize={20} darkMode={darkMode}/>
          </div>
        </Col>
      ) : (
        <hr />
      )}
    </PermissionsProvider>
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
          />
        )}
      </Col>
    </>
  );

  const timeZoneDifferenceComponent = (
    <>
      <Col md={desktopDisplay ? '5' : ''}>
        <label className={darkMode ? 'text-light' : ''}>Difference in this Time Zone from Your Local</label>
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
      <Col md={desktopDisplay ? '8' : ''} className={desktopDisplay ? 'mr-5' : ''}>
        <Label className={`mr-1 ${darkMode ? 'text-light' : ''}`}>
          {userProfile.endDate
            ? 'End Date ' + formatDateLocal(userProfile.endDate)
            : 'End Date ' + 'N/A'}
        </Label>
        {canEdit && !desktopDisplay && (
          <SetUpFinalDayButton
            loadUserProfile={loadUserProfile}
            setUserProfile={setUserProfile}
            isBigBtn={true}
            userProfile={userProfile}
            darkMode={darkMode}
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
            darkMode={darkMode}
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
            <Label className={darkMode ? 'text-light' : ''}>Status</Label>
          </Col>
          <Col>
            <Label className={darkMode ? 'text-light label-with-icon' : 'label-with-icon'}>
              {userProfile.isActive
                ? 'Active'
                : userProfile.reactivationDate
                ? 'Paused until ' + formatDateLocal(userProfile.reactivationDate)
                : 'Inactive'}
            </Label>
            &nbsp;
            {canEdit && (
              <PauseAndResumeButton
                setUserProfile={setUserProfile}
                loadUserProfile={loadUserProfile}
                isBigBtn={true}
                userProfile={userProfile}
                darkMode={darkMode}
              />
            )}
          </Col>
        </>
      ) : (
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
              {canEdit && (
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