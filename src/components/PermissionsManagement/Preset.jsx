import React, { useState, useRef } from 'react';
import { Button, Row } from 'reactstrap';
import PermissionList from './PermissionList';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { updateRole } from '../../actions/role';
import { updatePresetById, deletePresetById } from '../../actions/rolePermissionPresets';
import { BsFillCaretDownFill, BsFillCaretUpFill } from 'react-icons/bs';


const Preset = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  const onNameClicked = (e) => {
    if(editing){
      e.stopPropagation();
    }
  }

  const onEditIconClicked = (e) => {
    e.stopPropagation();
    setEditing(!editing);
    setTimeout(()=>{ref.current.focus()}, 0);
  };

  const onSaveNameChangeClicked = (e) => {
    e.stopPropagation();
    var newName = ref.current.textContent;
    props.updatePreset({...props.preset, presetName: newName});
    setEditing(false);
  };

  const applyPreset = async (preset) => {
    try {
      const updatedRole = {
        roleId: props.roleId,
        roleName: props.roleName,
        permissions: preset.permissions
      };
      props.updateRole(props.roleId, updatedRole);
      props.onApply(preset.permissions);
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: Row,
          cursor: 'pointer',
          width: '100%',
          borderBottom: 'solid',
          borderColor: 'grey',
          justifyContent: 'space-between'
        }}
        onClick={()=>setIsOpen(!isOpen)}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
          <h3 ref={ref} contentEditable={editing} suppressContentEditableWarning={true} onClick={onNameClicked} >{props.preset.presetName}</h3>
          <FontAwesomeIcon
                  icon={faEdit}
                  size="lg"
                  className="user-role-tab__icon edit-icon"
                  onClick={onEditIconClicked}
                />
          {editing &&
            <Button
              color='primary'
              onClick={onSaveNameChangeClicked}>
              Save Name
            </Button>}
          {isOpen ? <BsFillCaretUpFill/>:<BsFillCaretDownFill/> }
        </div>
        <div
          style={{
            display: 'flex',
            gap: '10px'
          }}>
          <Button color='danger' onClick={(event)=>{event.stopPropagation(); props.deletePreset(props.preset._id);}}>
            Delete
          </Button>
          <Button
            color='primary'
            onClick={(event)=>{event.stopPropagation(); applyPreset(props.preset);}}>
            Apply
          </Button>
        </div>
      </div>
      {isOpen ?
        <PermissionList
          rolePermissions={props.preset.permissions}
        />
      :<></>}
    </>
  );
};



const mapStateToProps = state => ({ roles: state.role.roles });

const mapDispatchToProps = dispatch => ({
  updateRole: (roleId, updatedRole) => dispatch(updateRole(roleId, updatedRole)),
  deletePreset: (presetId) => dispatch(deletePresetById(presetId)),
  updatePreset: (newPreset) => dispatch(updatePresetById(newPreset))
});

export default connect(mapStateToProps, mapDispatchToProps)(Preset);
