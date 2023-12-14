import {
  SET_MATERIALS, POST_UPDATE_MATERIAL_START_BULK, POST_UPDATE_MATERIAL_END_BULK,
  RESET_UPDATE_MATERIAL_BULK, POST_UPDATE_MATERIAL_ERROR_BULK, POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END,
  RESET_UPDATE_MATERIAL, POST_UPDATE_MATERIAL_ERROR
} from "constants/bmdashboard/materialsConstants"

const defaultState = {
  list: [],
  updateMaterials: {
    loading: false,
    result: null,
    error: undefined
  },
  updateMaterialsBulk: {
    loading: false,
    result: null,
    error: undefined
  }
}

export const materialsReducer = (materials = defaultState, action) => {
  switch (action.type) {
    case SET_MATERIALS: {
      return {
         list: action.payload,
         updateMaterials: defaultState.updateMaterials,
         updateMaterialBulk: defaultState.updateMaterialsBulk,
      }
    }
      // {
      //   materials.list = action.payload;
      //   return {
      //     ...materials, updateMaterials: { ...defaultState.updateMaterials },
      //     updateMaterialsBulk: { ...defaultState.updateMaterialsBulk }
      //   }
      // }
    case POST_UPDATE_MATERIAL_START:
      {
        const obj = { loading: true };
        materials.updateMaterials = obj;
        return { ...materials }
      }
    case POST_UPDATE_MATERIAL_END:
      {
        const obj = {
          result: action.payload,
          loading: false,
          error: false
        }
        materials.updateMaterials = obj;
        return { ...materials }
      }
    case POST_UPDATE_MATERIAL_ERROR:
      {
        const obj = {
          result: action.payload,
          loading: false,
          error: true
        }
        materials.updateMaterials = obj;
        return { ...materials }
      }
    case RESET_UPDATE_MATERIAL:
      {
        const obj = {
          loading: false,
          result: null,
          error: undefined
        }
        materials.updateMaterials = obj
        return { ...materials }

      }
    case POST_UPDATE_MATERIAL_START_BULK:
      {
        const obj = { loading: true }
        materials.updateMaterialsBulk = obj;
        return { ...materials }
      }
    case POST_UPDATE_MATERIAL_END_BULK:
      {
        const obj = { result: action.payload, loading: false, error: false }
        materials.updateMaterialsBulk = obj;
        return { ...materials }
      }

    case POST_UPDATE_MATERIAL_ERROR_BULK:
      {
        const obj = { result: action.payload, loading: false, error: true }
        materials.updateMaterialsBulk = obj;
        return { ...materials }
      }
    case RESET_UPDATE_MATERIAL_BULK:
      {
        const obj = { loading: false, result: null, error: undefined }
        materials.updateMaterialsBulk = obj;
        return { ...materials }
      }
    default:
      return materials;
  }
}