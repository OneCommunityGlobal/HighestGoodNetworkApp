import React, { useEffect, useState, useRef } from 'react';
import { Button, Dropdown, Form, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { addNewRole, getAllRoles } from '../../actions/role';
import { getAllUserProfile } from 'actions/userManagement';
import { permissionLabel } from './UserRoleTab';
import { modalInfo } from './RolePermissions';
import './PermissionsManagement.css';
import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';
import { boxStyle } from 'styles';

const UserPermissionsPopUp = ({ allUserProfiles, toggle, getAllUsers, roles }) => {
  const [searchText, onInputChange] = useState('');
  const [actualUserProfile, setActualUserProfile] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [isInputFocus, setIsInputFocus] = useState(false);
  const [actualUserRolePermission, setActualUserRolePermission] = useState();
  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);
  //no onchange, always change this state;
  const onChangeCheck = data => {
    const actualValue = data;

    setActualUserProfile(previous => {
      const permissionsUser = previous.permissions;
      const permissionsUserFront = permissionsUser?.frontPermissions;

      let isAlreadyChecked = previous.permissions?.frontPermissions?.some(
        perm => perm === actualValue,
      );
      if (isAlreadyChecked === undefined) isAlreadyChecked = false;

      const unCheckPermission = previous.permissions?.frontPermissions?.filter(
        perm => perm !== actualValue,
      );

      const actualPermissionsFront = isAlreadyChecked
        ? unCheckPermission
        : [...permissionsUserFront, actualValue];


      const newPermissionsObject = {
        frontPermissions: actualPermissionsFront,
      };
      return { ...previous, permissions: newPermissionsObject };
    });
  };

  const handleModalOpen = idx => {
    setContent(modalInfo[idx]);
    setinfoRoleModal(true);
  };
  const refInput = useRef();
  const getUserData = async userId => {
    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    setActualUserProfile(allUserInfo);
  };
  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
  };
  useEffect(() => {
    getAllUsers();
    if (actualUserProfile?.role && roles) {
      const roleIndex = roles?.findIndex(({ roleName }) => roleName === actualUserProfile?.role);
      const permissions = roleIndex !== -1 ? roles[roleIndex].permissions : [];
      setActualUserRolePermission(permissions);
    }
  }, [actualUserProfile]);

  const isPermissionChecked = permission =>
    actualUserProfile?.permissions?.frontPermissions.some(perm => perm === permission);

  const isPermissionDefault = permission => {
    return actualUserRolePermission?.includes(permission);
  };

  const updateProfileOnSubmit = async e => {
    e.preventDefault();
    const userId = actualUserProfile?._id;

    const url = ENDPOINTS.USER_PROFILE(userId);
    const allUserInfo = await axios.get(url).then(res => res.data);
    const newUserInfo = { ...allUserInfo, ...actualUserProfile };
   
    await axios
      .put(url, newUserInfo)
      .then(res => {
        res.data;
      })
      .catch(err => console.log(err));
    getAllUsers();

    const SUCCESS_MESSAGE = `
        Permission has been updated successfully. Be sure to tell them that you are changing these
        permissions and for that they need to log out and log back in for their new permissions to take
        place.`;
    toast.success(SUCCESS_MESSAGE, {
      autoClose: 10000,
    });
  };
  const mainPermissions = ['See All the Reports Tab', 'See User Management Tab (Full Functionality)', 'See Badge Management Tab (Full Functionality)', 'See Project Management Tab (Full Functionality)', 'Edit Project', 'See Teams Management Tab (Full Functionality)', 'Edit Timelog Information', 'Edit User Profile', 'See Permissions Management Tab' ]
  return (
    <>
    <Form
      id="manage__user-permissions"
      onSubmit={e => {
        updateProfileOnSubmit(e);
      }}
    >
      <h4 className="user-permissions-pop-up__title">User name:</h4>
      <Dropdown
        isOpen={isOpen}
        toggle={() => {
          setIsOpen(!isOpen);
        }}
        style={{ width: '100%', marginRight: '5px' }}
      >
        <Input
          type="text"
          value={searchText}
          ref={refInput}
          onFocus={e => {
            setIsInputFocus(true);
            setIsOpen(true);
          }}
          onChange={e => {
            onInputChange(e.target.value);
            setIsOpen(true);
          }}
        />
        {isInputFocus || (searchText !== '' && allUserProfiles && allUserProfiles.length > 0) ? (
          <div
            tabIndex="-1"
            role="menu"
            aria-hidden="false"
            className={`dropdown-menu${isOpen ? ' show dropdown__user-perms' : ''}`}
            style={{ marginTop: '0px', width: '100%' }}
          >
            {allUserProfiles
              .filter(user => {
                if (
                  user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
                  user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
                  `${user.firstName} ${user.lastName}`
                    .toLowerCase()
                    .includes(searchText.toLowerCase())
                ) {
                  return user;
                }
              })
              .map(user => (
                <div
                  className="user__auto-complete"
                  key={user._id}
                  onClick={() => {
                    onInputChange(`${user.firstName} ${user.lastName}`);
                    setIsOpen(false);
                    setActualUserProfile(user);
                    getUserData(user._id);
                  }}
                >
                  {`${user.firstName} ${user.lastName}`}
                </div>
              ))}
          </div>
        ) : (
          <></>
        )}
      </Dropdown>
      <div>
        <h4 className="user-permissions-pop-up__title">Permissions:</h4>
        <ul className="user-role-tab__permission-list">
          {Object.entries(permissionLabel).map(([key, value]) => { 
            const isValueInMainPermissions = mainPermissions.includes(value);

            if (isValueInMainPermissions) {
            return (
              <li key={key} className="user-role-tab__permission">
                
                <div
                  style={{
                    color: isPermissionChecked(key) || isPermissionDefault(key) ? 'green' : 'red',
                    fontSize: '20px'
                  }}
                >
                  {value}
                </div>
                <div className='infos'>
                <i
                id= 'info-icon__permissions'
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen(value);
                }}
              />
                  </div>
                
                {isPermissionChecked(key) ? (
                  <div style={{paddingLeft: '15px'}}>
                  <Button
                    className="info-button"
                    type="button"
                    color="danger"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                    style={boxStyle}
                  >
                    Remove
                  </Button>
                  </div>
                ) : (
                  <div style={{paddingLeft: '15px'}}>
                  <Button
                    className="info-button"
                    type="button"
                    color="success"
                    onClick={e => onChangeCheck(key)}
                    disabled={actualUserProfile ? false : true}
                    style={boxStyle}
                  >
                    Add
                  </Button>
                  </div>
                )}
              </li>
            );
          } else {
            return (<li key={key} className="user-role-tab__permission">
              
            <div
              style={{
                color: isPermissionChecked(key) || isPermissionDefault(key) ? 'green' : 'red',
                paddingLeft: '30px', paddingBottom: '10px'
              }}
            >
              {value}
            </div>

            <div className='infos'>
                <i
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen(value);
                }}
              />
              </div>
             
            {isPermissionChecked(key) ? (
              <div style={{paddingLeft: '15px'}}>
              <Button
                className="info-button"
                type="button"
                color="danger"
                onClick={e => onChangeCheck(key)}
                disabled={actualUserProfile ? false : true}
                style={boxStyle}
              >
                Remove
              </Button>
              </div>
            ) : (
              <div style={{paddingLeft: '15px'}}>
              <Button
                className="info-button"
                type="button"
                color="success"
                onClick={e => onChangeCheck(key)}
                disabled={actualUserProfile ? false : true}
                style={boxStyle}
              >
                Add
              </Button>
              </div>
            )}
          </li>);
          }
            
          })
          }
        </ul>
      </div>
      <Button
        type="submit"
        id="manage__user-permissions"
        color="primary"
        size="lg"
        block
        style={{ ...boxStyle, marginTop: '1rem' }}
      >
        Submit
      </Button>
    </Form>
    <Modal isOpen={infoRoleModal} toggle={toggleInfoRoleModal}>
        <ModalHeader toggle={toggleInfoRoleModal}>Permission Info</ModalHeader>
        <ModalBody>{modalContent}</ModalBody>
        <ModalFooter>
          <Button onClick={toggleInfoRoleModal} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
  
};

const mapStateToProps = state => ({
  roles: state.role.roles,
  allUserProfiles: state.allUserProfiles.userProfiles,
  permissionsUser: state.auth.permissions,
});

const mapDispatchToProps = dispatch => ({
  getAllRoles: () => dispatch(getAllRoles()),
  addNewRole: newRole => dispatch(addNewRole(newRole)),
  getAllUsers: () => dispatch(getAllUserProfile()),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserPermissionsPopUp);
