import {
  SET_MATERIALS,
  POST_UPDATE_MATERIAL_START_BULK,
  POST_UPDATE_MATERIAL_END_BULK,
  RESET_UPDATE_MATERIAL_BULK,
  POST_UPDATE_MATERIAL_ERROR_BULK,
  POST_UPDATE_MATERIAL_START,
  POST_UPDATE_MATERIAL_END,
  RESET_UPDATE_MATERIAL,
  POST_UPDATE_MATERIAL_ERROR,
} from 'constants/bmdashboard/materialsConstants';

const defaultState = {
  materialslist: [],
  updateMaterials: {
    loading: false,
    result: null,
    error: undefined,
  },
  updateMaterialsBulk: {
    loading: false,
    result: null,
    error: undefined,
  },
};

// eslint-disable-next-line default-param-last
export default function materialsReducer(materials = defaultState, action) {
  switch (action.type) {
    case SET_MATERIALS: {
      return {
        ...materials,
        materialslist: action.payload,
        updateMaterials: { ...defaultState.updateMaterials },
        updateMaterialsBulk: { ...defaultState.updateMaterialsBulk },
      };
    }
    case POST_UPDATE_MATERIAL_START: {
      const obj = { loading: true };
      return { ...materials, updateMaterials: obj };
    }
    case POST_UPDATE_MATERIAL_END: {
      const obj = {
        result: action.payload,
        loading: false,
        error: false,
      };
      return { ...materials, updateMaterials: obj };
    }
    case POST_UPDATE_MATERIAL_ERROR: {
      const obj = {
        result: action.payload,
        loading: false,
        error: true,
      };
      return { ...materials, updateMaterials: obj };
    }
    case RESET_UPDATE_MATERIAL: {
      const obj = {
        loading: false,
        result: null,
        error: undefined,
      };
      return { ...materials, updateMaterials: obj };
    }
    case POST_UPDATE_MATERIAL_START_BULK: {
      const obj = { loading: true };
      return { ...materials, updateMaterialsBulk: obj };
    }
    case POST_UPDATE_MATERIAL_END_BULK: {
      const obj = { result: action.payload, loading: false, error: false };
      return { ...materials, updateMaterialsBulk: obj };
    }
    case POST_UPDATE_MATERIAL_ERROR_BULK: {
      const obj = { result: action.payload, loading: false, error: true };
      return { ...materials, updateMaterialsBulk: obj };
    }
    case RESET_UPDATE_MATERIAL_BULK: {
      const obj = { loading: false, result: null, error: undefined };
      return { ...materials, updateMaterialsBulk: obj };
    }
    default:
      return materials;
  }
}
