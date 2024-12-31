import { rolePresetReducer } from '../rolePresetReducer';
import * as types from '../../constants/rolePermissionPresets';

describe('rolePresetReducer', () => {
  const initialState = {
    presets: [],
  };

  // Test case 1: Test RECEIVE_PRESETS action
  it('should handle RECEIVE_PRESETS', () => {
    const action = {
      type: types.RECEIVE_PRESETS,
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 2, presetName: 'User' }],
    };

    const newState = rolePresetReducer(initialState, action);

    expect(newState).toEqual({
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 2, presetName: 'User' }],
    });
  });

  // Test case 2: Test ADD_NEW_PRESET action
  it('should handle ADD_NEW_PRESET', () => {
    const action = {
      type: types.ADD_NEW_PRESET,
      payload: { _id: 3, presetName: 'Editor' },
    };

    const newState = rolePresetReducer(
      { ...initialState, presets: [{ _id: 1, presetName: 'Admin' }] },
      action
    );

    expect(newState).toEqual({
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 3, presetName: 'Editor' }],
    });
  });

  // Test case 3: Test UPDATE_PRESET action
  it('should handle UPDATE_PRESET', () => {
    const action = {
      type: types.UPDATE_PRESET,
      payload: { _id: 2, presetName: 'Super User' },
    };

    const initialStateWithPresets = {
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 2, presetName: 'User' }],
    };

    const newState = rolePresetReducer(initialStateWithPresets, action);

    expect(newState).toEqual({
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 2, presetName: 'Super User' }],
    });
  });

  // Test case 4: Test DELETE_PRESET action
  it('should handle DELETE_PRESET', () => {
    const action = {
      type: types.DELETE_PRESET,
      presetId: 1,
    };

    const initialStateWithPresets = {
      presets: [{ _id: 1, presetName: 'Admin' }, { _id: 2, presetName: 'User' }],
    };

    const newState = rolePresetReducer(initialStateWithPresets, action);

    expect(newState).toEqual({
      presets: [{ _id: 2, presetName: 'User' }],
    });
  });

  // Test case 5: Test default case (no action matches)
  it('should return the current state for unknown action', () => {
    const action = {
      type: 'UNKNOWN_ACTION',
    };

    const newState = rolePresetReducer(initialState, action);

    expect(newState).toEqual(initialState);
  });
});