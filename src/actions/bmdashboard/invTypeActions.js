import axios from 'axios';
import { ENDPOINTS } from "utils/URL";
import GET_MATERIAL_TYPES, {
  POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_MATERIAL_INVENTORY_TYPE,
  RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE,
  GET_INV_BY_TYPE,
  DELETE_BUILDING_INVENTORY_TYPE,
  RESET_DELETE_BUILDING_INVENTORY_TYPE,
  DELETE_ERROR_BUILDING_INVENTORY_TYPE,
  UPDATE_BUILDING_INVENTORY_TYPE,
  RESET_UPDATE_BUILDING_INVENTORY_TYPE,
  UPDATE_ERROR_BUILDING_INVENTORY_TYPE,
  GET_TOOL_TYPES,
  GET_CONSUMABLE_TYPES,
  GET_EQUIPMENT_TYPES,
  GET_REUSABLE_TYPES,
  RESET_POST_BUILDING_TOOL_INVENTORY_TYPE,
  POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_ERROR_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  RESET_POST_BUILDING_CONSUMABLE_INVENTORY_TYPE,
  POST_BUILDING_TOOL_INVENTORY_TYPE,
  POST_ERROR_BUILDING_TOOL_INVENTORY_TYPE, 
} from "constants/bmdashboard/inventoryTypeConstants";
import { POST_TOOLS_LOG, POST_ERROR_TOOLS_LOG, RESET_POST_TOOLS_LOG } from 'constants/bmdashboard/toolsConstants';
import { GET_ERRORS } from "constants/errors";

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
  console.log("fetchReusableTypes");
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
        // console.log("tool types: ", res)
        dispatch(setToolTypes(res.data));
      })
      .catch(err => {
        // console.log("fetchToolTypes err: ", err)
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

export const deleteBuildingInventoryType = (payload) => {
  const {category, id} = payload
  return async dispatch => {
    axios.delete(`${ENDPOINTS.BM_INVTYPE_ROOT}/${category}/${id}`)
      .then(res => {
        dispatch(setDeleteInvTypeResult(res.data))
        // update inventory types with updated list received from the request
        dispatch(setInvTypesByType({ type: category, data: res.data }))
      })
      .catch(err => {
        dispatch(setDeleteInvTypeError(err.response.data))
      })
  }
}

export const updateBuildingInventoryType = (payload) => {
  const {category, id, name, description} = payload
  return async dispatch => {
    axios.put(`${ENDPOINTS.BM_INVTYPE_ROOT}/${category}/${id}`, {name, description})
      .then(res => {
        dispatch(setUpdateInvTypeResult(res.data))
        // update inventory types with updated list received from the request
        dispatch(setInvTypesByType({ type: category, data: res.data }))
      })
      .catch(err => {
        dispatch(setUpdateInvTypeError(err.response.data))
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

export const resetPostBuildingInventoryTypeResult = () => {
  return {
    type: RESET_POST_BUILDING_MATERIAL_INVENTORY_TYPE
  }
}

export const setDeleteInvTypeResult = (payload) => {
  return {
    type: DELETE_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const setDeleteInvTypeError = (payload) => {
  return {
    type: DELETE_ERROR_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const resetDeleteInvTypeResult = () => {
  return {
    type: RESET_DELETE_BUILDING_INVENTORY_TYPE
  }
}

export const setUpdateInvTypeResult = (payload) => {
  return {
    type: UPDATE_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const setUpdateInvTypeError = (payload) => {
  return {
    type: UPDATE_ERROR_BUILDING_INVENTORY_TYPE,
    payload
  }
}

export const resetUpdateInvTypeResult = () => {
  return {
    type: RESET_UPDATE_BUILDING_INVENTORY_TYPE
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


export const setMaterialTypes = payload => {
  return {
    type: GET_MATERIAL_TYPES,
    payload
  }
}

export const setEquipmentTypes = payload => {
  return {
    type: GET_EQUIPMENT_TYPES,
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
};
// 
export const postToolsLog = payload => {
  return async dispatch => {
    axios
      .post(ENDPOINTS.BM_LOG_TOOLS, payload)
      .then(res => {
        // eslint-disable-next-line no-console
        // eslint-disable-next-line no-use-before-define
        dispatch(setToolsLogResult(res.data));
      })
      .catch(err => {
        dispatch(
          // setPostErrorToolsLog(JSON.stringify(err.response.data) || 'Sorry! Some error occurred!'),
          // eslint-disable-next-line no-use-before-define
          setPostErrorToolsLog(err.response.data || 'Sorry! Some error occurred!'),
        );
      });
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

export const resetPostToolsLog = () => {
  return {
    type: RESET_POST_TOOLS_LOG,
  };
};