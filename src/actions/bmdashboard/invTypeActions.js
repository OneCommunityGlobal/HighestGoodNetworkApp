import axios from 'axios';

import { ENDPOINTS } from '../../utils/URL';

import GET_MATERIAL_TYPES, {
  POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  GET_INV_BY_TYPE,
  GET_TOOL_TYPES,
  GET_REUSABLE_TYPES,
} from '../../constants/bmdashboard/inventoryTypeConstants';
import { GET_ERRORS } from '../../constants/errors';

export const fetchMaterialTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIAL_TYPES)
      .then(res => {
        dispatch(setMaterialTypes(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const fetchReusableTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_REUSABLE_TYPES)
      .then(res => {
        dispatch(setReusableTypes(res.data))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const fetchToolTypes = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_TOOL_TYPES)
      .then(res => {
        dispatch(setToolTypes(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const fetchConsumableTypes = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_CONSUMABLES)
      .then(res => {
        dispatch(setConsumableTypes(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
};

export const fetchInvTypeByType = (type) => {
  const url = ENDPOINTS.BM_INVTYPE_TYPE(type);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setInvTypesByType({ type: type, data: res.data }))
      })
      .catch(err => {
        dispatch(setErrors(err))
      })
  }
}

export const postBuildingConsumableType = payload => {
  return async dispatch => {
    axios
      .post(ENDPOINTS.BM_CONSUMABLES, payload)
      .then(res => {
        console.log("res: ", res)
        dispatch(setPostBuildingConsumableTypeResult(res.data));
      })
      .catch(err => {
        console.log("err: ", err)
        dispatch(
          setPostErrorBuildingConsumableTypeResult(
            JSON.stringify(err.response.data) || 'Sorry! Some error occurred!',
          ),
        );
      });
  };
};

export const postBuildingInventoryType = (payload) => {
  return async dispatch => {
    axios.post(ENDPOINTS.BM_MATERIAL_TYPE, payload)
      .then(res => {
        dispatch(setPostBuildingInventoryTypeResult(res.data))
      })
      .catch(err => {
        dispatch(setPostErrorBuildingInventoryTypeResult(JSON.stringify(err.response.data) || 'Sorry! Some error occurred!'))
      })
  }
}

export const setPostBuildingInventoryTypeResult = (payload) => {
  return {
    type: POST_BUILDING_MATERIAL_INVENTORY_TYPE,
    payload
  }
}


export const setPostBuildingConsumableTypeResult = payload => {
  return {
    type: POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
    payload,
  };
};


export const setPostErrorBuildingInventoryTypeResult = (payload) => {
  return {
    type: POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
    payload
  }
}


export const setPostErrorBuildingConsumableTypeResult = payload => {
  return {
    type: POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE,
    payload,
  };
};


export const resetPostBuildingInventoryTypeResult = () => {
  return {
    type: RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE
  }
}

export const resetPostBuildingConsumableTypeResult = () => {
  return {
    type: RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  };
};



export const setMaterialTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setReusableTypes = payload => {
  return {
    type: GET_REUSABLE_TYPES,
    payload
  }
}

export const setToolTypes = payload => {
  return {
    type: GET_TOOL_TYPES,
    payload,
  };
};
export const setInvTypesByType = payload => {

  return {
    type: GET_INV_BY_TYPE,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const setConsumableTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES, //check reducer! 
    payload,
  };
};

