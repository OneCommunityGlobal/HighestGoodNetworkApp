import * as types from '../constants/rolePermissionPresets';

const initialState = {
  presets: [],
};

// eslint-disable-next-line default-param-last
export const rolePresetReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.RECEIVE_PRESETS: {
      return { ...state, presets: action.presets };
    }

    case types.ADD_NEW_PRESET: {
      // Create a new array to ensure immutability
      return { ...state, presets: [...state.presets, action.payload] };
    }

    case types.UPDATE_PRESET: {
      const presetUpdated = action.payload;
      const updatedPresets = state.presets.map(preset => {
        if (preset._id === presetUpdated._id) {
          return {
            ...preset,
            presetName: presetUpdated.presetName,
          };
        }
        return preset;
      });
      return { ...state, presets: updatedPresets };
    }

    case types.DELETE_PRESET: {
      // Filter creates a new array
      const presetsFiltered = state.presets.filter(preset => preset._id !== action.presetId);
      return { ...state, presets: presetsFiltered };
    }

    default:
      return state;
  }
};

export default rolePresetReducer;
