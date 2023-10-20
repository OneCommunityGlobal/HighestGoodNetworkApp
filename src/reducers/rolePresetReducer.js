import * as types from '../constants/rolePermissionPresets';

const initialState = {
  presets: [],
};

// eslint-disable-next-line import/prefer-default-export,default-param-last
export const rolePresetReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.RECEIVE_PRESETS:
      return { ...state, presets: action.presets };

    case types.ADD_NEW_PRESET: {
      const toAdd = state.presets;
      toAdd.push(action.payload);
      return { ...state, presets: toAdd };
    }

    case types.UPDATE_PRESET: {
      const presetUpdated = action.payload;
      const indexPresetUpdated = state.presets.findIndex(
        preset => preset._id === presetUpdated._id,
      );
      const presetsCopy = state.presets;

      presetsCopy[indexPresetUpdated].presetName = presetUpdated.presetName;

      return { ...state, presets: presetsCopy };
    }

    case types.DELETE_PRESET: {
      const presetsFiltered = state.presets.filter(preset => preset._id !== action.presetId);
      return { ...state, presets: presetsFiltered };
    }

    default:
      return state;
  }
};
