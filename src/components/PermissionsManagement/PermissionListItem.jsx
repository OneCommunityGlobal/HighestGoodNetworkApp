import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import { boxStyle } from 'styles';
import PermissionList from './PermissionList';
import hasPermission from '../../utils/permissions';
import './UserRoleTab.css';




const PermissionListItem = (props) => {
  const {rolePermissions, immutablePermissions, label, permission, subperms, description, editable, depth, setPermissions} = props;
  const isCategory = !!subperms;
  const [infoRoleModal, setinfoRoleModal] = useState(false);
  const [modalContent, setContent] = useState(null);
  const hasThisPermission = rolePermissions.includes(permission) || immutablePermissions.includes(permission);

  const handleModalOpen = description => {
    setContent(description);
    setinfoRoleModal(true);
  };

  const toggleInfoRoleModal = () => {
    setinfoRoleModal(!infoRoleModal);
  };

  const togglePermission = (permission) => {
    rolePermissions.includes(permission) || immutablePermissions.includes(permission)
      ? setPermissions(previous => previous.filter(perm => perm !== permission))
      : setPermissions(previous => [...previous, permission]);
    props.onChange();
  };

  const setSubpermissions = (subperms, adding) => {
    for(const subperm of subperms) {
      if(subperm.subperms){
        setSubpermissions(subperm.subperms, adding);
      } else if(adding != rolePermissions.includes(subperm.key)) {
        togglePermission(subperm.key);
      }
    }
  };

  //returns 'All', 'None', or 'Some' depending on if that role has that selection of permissions
  const checkSubperms = (subperms) => {
    if(!subperms){
      return;
    }
    let list = [...subperms];
    let all = true;
    let none = true;

    while(list.length>0){
      const perm = list.pop();
      if(perm.subperms){
        list = list.concat(perm.subperms)
      } else if(rolePermissions.includes(perm.key) || immutablePermissions.includes(perm.key)){
        none = false
      } else {
        all = false
      }
    }

    if(all){
      return 'All'
    }
    if(none){
      return 'None'
    }
    return 'Some'
  };

  const howManySubpermsInRole = checkSubperms(subperms);

  return (
    <>
      <li className="user-role-tab__permissions" key={permission}>
        <p
          style={{
            color: isCategory ?
              howManySubpermsInRole === 'All' ? 'green' :
              howManySubpermsInRole === 'Some' ? 'black' : 'red'
              : hasThisPermission ? 'green' : 'red',
            fontSize: isCategory && '20px',
            textIndent: 50*depth+'px',
          }}
        >
          {label}
        </p>
          <div className="icon-button-container">
            <div className='infos'>
              <i
                data-toggle="tooltip"
                data-placement="center"
                title="Click for more information"
                aria-hidden="true"
                className="fa fa-info-circle"
                onClick={() => {
                  handleModalOpen(description);
                }}
              />
            </div>
            {!editable ? <></>:
            isCategory ?
            <Button
              className="icon-button"
              color={howManySubpermsInRole === 'All' ? 'danger' :
              howManySubpermsInRole === 'Some' ? 'secondary' : 'success'}
              onClick={() => {
                // const state = howManySubpermsInRole !== 'None';
                setSubpermissions(subperms, howManySubpermsInRole !== 'All');
                props.onChange();
              }}
              disabled={!props.hasPermission('putRole')}
              style={boxStyle}
            >
              {howManySubpermsInRole === 'All' ? 'Delete' : 'Add'}
            </Button> :
            <Button
              className="icon-button"
              color={hasThisPermission ? 'danger' : 'success'}
              onClick={() => {togglePermission(permission)}}
              disabled={!props.hasPermission('putRole') || immutablePermissions.includes(permission)}
              style={boxStyle}
            >
              {hasThisPermission ? 'Delete' : 'Add'}
            </Button>
          }
          </div>
      </li>
      {isCategory ?
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
            onChange={props.onChange}
            depth={depth+1}
          />
        </li> : <></>}
      <Modal
        isOpen={infoRoleModal}
        toggle={toggleInfoRoleModal}
        id="#modal2-body_new-role--padding"
      >
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



const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  hasPermission: permission => dispatch(hasPermission(permission)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PermissionListItem);
