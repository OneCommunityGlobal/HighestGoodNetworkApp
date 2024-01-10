import GET_MATERIAL_TYPES, { GET_INV_BY_TYPE } from "constants/bmdashboard/inventoryTypeConstants";

const defaultState = {
  list: [],
  invTypeList: {
    "All": null, "Materials": null, "Consumables": null, "Equipments": null,
    "Reusables": null, "Tools:": null
  }
}

export const bmInvTypeReducer = (types = defaultState, action) => {
  switch (action.type) {
    case GET_MATERIAL_TYPES: {
      types.list = action.payload
      return { ...types }
    }
    case GET_INV_BY_TYPE: {
      types.invTypeList[action.payload.type] = [...action.payload.data]
      return { ...types }
    }
    default: {
      return types;
    }
  }
}