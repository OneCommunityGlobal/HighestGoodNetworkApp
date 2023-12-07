import React, { useState } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Alert, Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import Preset  from './Preset';
import { boxStyle } from 'styles';


const PermissionsPresetsModal = (props) => {
  return (
    <>
      {props.presetsList?.length===0 ? 'There are no presets for this role.' : props.presetsList?.map((preset) => (
        <div key={preset._id}>
          <Preset
            preset={preset}
            roleId={props.roleId}
            roleName={props.roleName}
            onApply={props.onApply}
          />
        </div>
      ))}
    </>
  );
};

const mapStateToProps = state => ({ presetsList: state.rolePreset.presets });

// const mapDispatchToProps = dispatch => ({
// });

export default connect(mapStateToProps, null)(PermissionsPresetsModal);
