import GET_MATERIAL_TYPES, { GET_INV_BY_TYPE } from "constants/bmdashboard/inventoryTypeConstants";

const defaultState = {
  list: []
}

export const bmInvTypeReducer = (types = defaultState, action) => {
  switch (action.type) {
    case GET_MATERIAL_TYPES: {
      types.list = action.payload
      return { ...types }
    }
    case GET_INV_BY_TYPE: {
      types.list = action.payload
      return { ...types }
    }
  }
  return types
}