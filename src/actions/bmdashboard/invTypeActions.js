import axios from 'axios';
import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, { 
  POST_BUILDING_MATERIAL_INVENTORY_TYPE, 
  POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE, 
  RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE, 
  POST_BUILDING_CONSUMABLE_INVENTORY_TYPE, 
  POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE, 
  RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_BUILDING_TOOL_INVENTORY_TYPE, 
  POST_ERROR_BUILDING_TOOL_INVENTORY_TYPE, 
  RESET_POST_BUILDING_TOOL_INVENTORY_TYPE,
  GET_INV_BY_TYPE, 
  GET_TOOL_TYPES,
  GET_CONSUMABLE_TYPES,
  GET_EQUIPMENT_TYPES,          // Added
  GET_REUSABLE_TYPES           // Added
} from "constants/bmdashboard/inventoryTypeConstants";
import { POST_TOOLS_LOG, POST_ERROR_TOOLS_LOG, RESET_POST_TOOLS_LOG } from 'constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from "constants/errors";

// Setter Functions
export const setMaterialTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  };
};

export const setEquipmentTypes = payload => {    // Added
  return {
    type: GET_EQUIPMENT_TYPES,
    payload
  }
}

export const setReusableTypes = payload => {     // Added
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

export const setPostBuildingToolTypeResult = payload => {
  return {
    type: POST_BUILDING_TOOL_INVENTORY_TYPE,
    payload,
  };
};

export const setPostErrorBuildingInventoryTypeResult = (payload) => {
  return {
    type: POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
    payload
  }
}

export const setConsumableTypes = payload => {
  return {
    type: GET_CONSUMABLE_TYPES,
    payload,
  };
}

export const setPostErrorBuildingConsumableTypeResult = payload => {
  return {
    type: POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE,
    payload,
  };
};

export const setPostErrorBuildingToolTypeResult = payload => {
  return {
    type: POST_ERROR_BUILDING_TOOL_INVENTORY_TYPE,
    payload,
  };
};

export const setToolsLogResult = payload => {
  return {
    type: POST_TOOLS_LOG,
    payload,
  };
};

export const setPostErrorToolsLog = payload => {
  return {
    type: POST_ERROR_TOOLS_LOG,
    payload,
  };
};

// Action Creators
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

export const fetchEquipmentTypes = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_EQUIPMENT_TYPES)
      .then(res => {
        dispatch(setEquipmentTypes(res.data))
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

export const fetchInvTypeByType = (type) => {
  const url = ENDPOINTS.BM_INVTYPE_TYPE(type);
  return async dispatch => {
    axios.get(url)
      .then(res => {
        dispatch(setInvTypesByType({ type, data: res.data }))
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
        dispatch(setPostBuildingConsumableTypeResult(res.data));
      })
      .catch(err => {
        dispatch(
          setPostErrorBuildingConsumableTypeResult(
            JSON.stringify(err.response.data) || 'Sorry! Some error occurred!',
          ),
        );
      });
  };
};

export const postBuildingToolType = payload => {
  return async dispatch => {
    axios
      .post(ENDPOINTS.BM_TOOLS, payload)
      .then(res => {
        dispatch(setPostBuildingToolTypeResult(res.data));
      })
      .catch(err => {
        dispatch(
          setPostErrorBuildingToolTypeResult(
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

export const fetchConsumableTypes = () => {
  return async dispatch => {
    axios
      .get(ENDPOINTS.BM_CONSUMABLE_TYPES)
      .then(res => {
        dispatch(setConsumableTypes(res.data));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  };
}

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

export const resetPostBuildingToolTypeResult = () => {
  return {
    type: RESET_POST_BUILDING_TOOL_INVENTORY_TYPE,
  };
};

// Tools Log Actions
export const postToolsLog = payload => {
  return async dispatch => {
    axios
      .post(ENDPOINTS.BM_LOG_TOOLS, payload)
      .then(res => {
        dispatch(setToolsLogResult(res.data));
      })
      .catch(err => {
        dispatch(
          setPostErrorToolsLog(err.response.data || 'Sorry! Some error occurred!'),
        );
      });
  };
};

export const resetPostToolsLog = () => {
  return {
    type: RESET_POST_TOOLS_LOG,
  };
};
