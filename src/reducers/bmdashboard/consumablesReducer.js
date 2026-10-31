import {
  SET_CONSUMABLES,
  POST_UPDATE_CONSUMABLE_START,
  POST_UPDATE_CONSUMABLE_END,
  POST_UPDATE_CONSUMABLE_ERROR,
  UPDATE_CONSUMABLE_STATUS_START,
  UPDATE_CONSUMABLE_STATUS_END,
  UPDATE_CONSUMABLE_STATUS_ERROR,
} from '../../constants/bmdashboard/consumableConstants';

const defaultState = {
  consumableslist: [],
  updateConsumables: {
    loading: false,
    result: null,
    error: undefined,
  },
  updateConsumablesBulk: {
    loading: false,
    result: null,
    error: undefined,
  },
  updateConsumableStatus: {
    loading: false,
    result: null,
    error: undefined,
  },
};

// eslint-disable-next-line import/prefer-default-export, default-param-last
export const consumablesReducer = (consumables = defaultState, action) => {
  switch (action.type) {
    case SET_CONSUMABLES: {
      // eslint-disable-next-line no-param-reassign
      consumables.consumableslist = action.payload;
      return {
        ...consumables,
        updateConsumables: { ...defaultState.updateConsumables },
        updateConsumablesBulk: { ...defaultState.updateConsumablesBulk },
      };
    }
    case POST_UPDATE_CONSUMABLE_START: {
      const obj = { loading: true };
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumables = obj;
      return { ...consumables };
    }
    case POST_UPDATE_CONSUMABLE_END: {
      const obj = {
        result: action.payload,
        loading: false,
        error: false,
      };
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumables = obj;
      return { ...consumables };
    }

    case POST_UPDATE_CONSUMABLE_ERROR: {
      const obj = {
        result: action.payload,
        loading: false,
        error: true,
      };
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumables = obj;
      return { ...consumables };
    }
    case UPDATE_CONSUMABLE_STATUS_START: {
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumableStatus = { loading: true, result: null, error: undefined };
      return { ...consumables };
    }
    case UPDATE_CONSUMABLE_STATUS_END: {
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumableStatus = {
        loading: false,
        result: action.payload,
        error: false,
      };
      return { ...consumables };
    }
    case UPDATE_CONSUMABLE_STATUS_ERROR: {
      // eslint-disable-next-line no-param-reassign
      consumables.updateConsumableStatus = {
        loading: false,
        result: action.payload,
        error: true,
      };
      return { ...consumables };
    }
    default:
      return consumables;
  }
};
