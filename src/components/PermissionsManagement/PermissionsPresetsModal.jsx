import { connect } from 'react-redux';
import Preset from './Preset';

function PermissionsPresetsModal(props) {
  return (
    // No need for a fragment
    props.presetsList?.length === 0
      ? 'There are no presets for this role.'
      : props.presetsList?.map(preset => (
          <div key={preset._id}>
            <Preset
              preset={preset}
              roleId={props.roleId}
              roleName={props.roleName}
              onApply={props.onApply}
            />
          </div>
        ))
  );
}

const mapStateToProps = state => ({ presetsList: state.rolePreset.presets });

export default connect(mapStateToProps, null)(PermissionsPresetsModal);
