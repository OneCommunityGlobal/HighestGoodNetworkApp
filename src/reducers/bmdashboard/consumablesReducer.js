import {
  SET_CONSUMABLES,
  POST_UPDATE_CONSUMABLE_START,
  POST_UPDATE_CONSUMABLE_END,
  POST_UPDATE_CONSUMABLE_ERROR
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

// eslint-disable-next-line import/prefer-default-export
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
    case POST_UPDATE_CONSUMABLE_START:
        {
          console.log("POST_UPDATE_CONSUMABLE_START case in consumablesReducer")
          const obj = { loading: true };
          consumables.updateConsumables = obj;
          return { ...consumables }
        }
    case POST_UPDATE_CONSUMABLE_END:
          {
            console.log("POST_UPDATE_CONSUMABLE_END case in consumablesReducer")
            const obj = {
              result: action.payload,
              loading: false,
              error: false
            }
            consumables.updateConsumables = obj;
            return { ...consumables }
          } 

    case POST_UPDATE_CONSUMABLE_ERROR:
        {
          console.log("POST_UPDATE_CONSUMABLE_ERROR case in consumablesReducer")
          const obj = {
            result: action.payload,
            loading: false,
            error: true
          }
          console.log("obj: ", obj)
          consumables.updateConsumables = obj;
          return { ...consumables }
      }
    default:
      return consumables;
  }
}