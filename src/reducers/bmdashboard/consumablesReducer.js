import {
  SET_CONSUMABLES
} from "constants/bmdashboard/consumableConstants"

const defaultState = {
  consumableslist: [],
  updateConsumables: {
    loading: false,
    result: null,
    error: undefined
  },
  updateConsumablesBulk: {
    loading: false,
    result: null,
    error: undefined
  }
}

export const consumablesReducer = (consumables = defaultState, action) => {
  switch (action.type) {
    case SET_CONSUMABLES:
      {
        consumables.consumableslist = action.payload;
        return {
          ...consumables, updateConsumables: { ...defaultState.updateConsumables },
          updateConsumablesBulk: { ...defaultState.updateConsumablesBulk }
        }
      }
    default:
      return consumables;
  }
}