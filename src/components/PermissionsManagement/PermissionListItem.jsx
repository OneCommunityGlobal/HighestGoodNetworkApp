/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable no-nested-ternary */
import { useState, useContext } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { boxStyle, boxStyleDark } from 'styles';
// eslint-disable-next-line import/no-cycle
import { ModalContext } from 'context/ModalContext';
// eslint-disable-next-line import/no-cycle
import PermissionList from './PermissionList';
import hasPermission from '../../utils/permissions';
import './UserRoleTab.css';

function PermissionListItem(props) {
  const {
    rolePermissions,
    immutablePermissions,
    label,
    permission,
    subperms,
    description,
    editable,
    depth,
    setPermissions,
    darkMode,
  } = props;
  const isCategory = !!subperms;
  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);
  const hasThisPermission =
    rolePermissions.includes(permission) || immutablePermissions.includes(permission);
  const { updateModalStatus } = useContext(ModalContext);

  const handleModalOpen = () => {
    setContent(description);
    setinfoRoleModal(true);
  };

  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
  };

  // eslint-disable-next-line no-shadow
  const togglePermission = permission => {
    if (rolePermissions.includes(permission) || immutablePermissions.includes(permission)) {
      setPermissions(previous => previous.filter(perm => perm !== permission));
    } else if (rolePermissions.includes('showModal')) {
      setPermissions(previous => [...previous, permission]);
    } else {
      setPermissions(previous => [...previous, permission, 'showModal']);
    }

    props.onChange();
  };

  // eslint-disable-next-line no-shadow
  const setSubpermissions = (subperms, adding) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const subperm of subperms) {
      if (subperm.subperms) {
        setSubpermissions(subperm.subperms, adding);
      } else if (adding !== rolePermissions.includes(subperm.key)) {
        togglePermission(subperm.key);
      }
    }
  };

  // returns 'All', 'None', or 'Some' depending on if that role has that selection of permissions
  // eslint-disable-next-line no-shadow
  const checkSubperms = subperms => {
    if (!subperms) {
      return;
    }

    let list = [...subperms];
    let all = true;
    let none = true;

    while (list.length > 0) {
      const perm = list.pop();
      if (perm.subperms) {
        list = list.concat(perm.subperms);
      } else if (rolePermissions.includes(perm.key) || immutablePermissions.includes(perm.key)) {
        none = false;
      } else {
        all = false;
      }
    }

    if (all) {
      // eslint-disable-next-line consistent-return
      return 'All';
    }
    if (none) {
      // eslint-disable-next-line consistent-return
      return 'None';
    }
    // eslint-disable-next-line consistent-return
    return 'Some';
  };

  const howManySubpermsInRole = checkSubperms(subperms);

  let color;
  if (isCategory) {
    if (howManySubpermsInRole === 'All') {
      color = darkMode ? 'lightgreen' : 'green';
    } else if (howManySubpermsInRole === 'Some') {
      color = darkMode ? 'white' : 'black';
    } else {
      color = darkMode ? '#f94144' : 'red';
    }
  } else if (darkMode) {
    color = hasThisPermission ? 'lightgreen' : '#f94144';
  } else {
    // eslint-disable-next-line no-unused-vars
    color = hasThisPermission ? 'green' : 'red';
  }

  // eslint-disable-next-line no-unused-vars
  const fontSize = isCategory ? '20px' : undefined;
  // eslint-disable-next-line no-unused-vars
  const textIndent = `${50 * depth}px`;
  // eslint-disable-next-line no-unused-vars
  const textShadow = darkMode ? '0.5px 0.5px 2px black' : '';

  // eslint-disable-next-line no-unused-vars
  const getColor = () => {
    if (howManySubpermsInRole === 'All') {
      return 'danger';
    }
    if (howManySubpermsInRole === 'Some') {
      return 'secondary';
    }
    return 'success';
  };

  return (
    <>
      <li className="user-role-tab__permissions pr-2" key={permission} data-testid={permission}>
        <p
          style={{
            color: isCategory
              ? howManySubpermsInRole === 'All'
                ? 'green'
                : howManySubpermsInRole === 'Some'
                ? darkMode
                  ? 'white'
                  : 'black'
                : 'red'
              : hasThisPermission
              ? 'green'
              : 'red',
            fontSize: isCategory && '20px',
            textIndent: `${50 * depth}px`,
          }}
        >
          {label}
        </p>
        <div className="icon-button-container">
          <div className="infos">
            <i
              data-toggle="tooltip"
              data-placement="center"
              title="Click for more information"
              aria-hidden="true"
              className="fa fa-info-circle"
              onClick={() => {
                handleModalOpen(description);
              }}
              style={{ color: darkMode ? 'white' : 'black' }}
            />
          </div>
          {!editable ? (
            <></>
          ) : isCategory ? (
            <Button
              className="icon-button"
              color={
                howManySubpermsInRole === 'All'
                  ? 'danger'
                  : howManySubpermsInRole === 'Some'
                  ? 'secondary'
                  : 'success'
              }
              onClick={() => {
                // eslint-disable-next-line no-debugger
                // const state = howManySubpermsInRole !== 'None';
                setSubpermissions(subperms, howManySubpermsInRole !== 'All');
                props.onChange();
                updateModalStatus(true);
              }}
              disabled={!props.hasPermission('putRole')}
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {howManySubpermsInRole === 'All' ? 'Delete' : 'Add'}
            </Button>
          ) : (
            <Button
              className="icon-button"
              color={hasThisPermission ? 'danger' : 'success'}
              onClick={() => {
                togglePermission(permission);
                updateModalStatus(true);
              }}
              disabled={
                !props.hasPermission('putRole') || immutablePermissions.includes(permission)
              }
              style={darkMode ? boxStyleDark : boxStyle}
            >
              {hasThisPermission ? 'Delete' : 'Add'}
            </Button>
          )}
        </div>
      </li>
      {isCategory ? (
        <li
          className="user-role-tab__permissionList"
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PermissionList
            rolePermissions={rolePermissions}
            permissionsList={subperms}
            immutablePermissions={immutablePermissions}
            editable={editable}
            setPermissions={setPermissions}
            // eslint-disable-next-line react/destructuring-assignment
            onChange={props.onChange}
            depth={depth + 1}
            darkMode={darkMode}
          />
        </li>
      ) : null}
      <Modal
        isOpen={infoRoleModal}
        toggle={toggleInfoRoleModal}
        id="#modal2-body_new-role--padding"
        className={darkMode ? 'text-light dark-mode' : ''}
      >
        <ModalHeader toggle={toggleInfoRoleModal} className={darkMode ? 'bg-space-cadet' : ''}>
          Permission Info
        </ModalHeader>
        <ModalBody className={darkMode ? 'bg-yinmn-blue' : ''}>{modalContent}</ModalBody>
        <ModalFooter className={darkMode ? 'bg-yinmn-blue' : ''}>
          <Button onClick={toggleInfoRoleModal} color="secondary" className="float-left">
            {' '}
            Ok{' '}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionListItem);
