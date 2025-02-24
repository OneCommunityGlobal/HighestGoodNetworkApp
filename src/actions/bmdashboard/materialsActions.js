import axios from "axios";

import { ENDPOINTS } from "utils/URL";
import {
  SET_MATERIALS, POST_UPDATE_MATERIAL_START, POST_UPDATE_MATERIAL_END, RESET_UPDATE_MATERIAL,
  POST_UPDATE_MATERIAL_ERROR, POST_UPDATE_MATERIAL_START_BULK, POST_UPDATE_MATERIAL_END_BULK,
  RESET_UPDATE_MATERIAL_BULK, POST_UPDATE_MATERIAL_ERROR_BULK, UPDATE_MATERIAL_STATUS_END, UPDATE_MATERIAL_STATUS_ERROR, UPDATE_MATERIAL_STATUS_START,
} from "constants/bmdashboard/materialsConstants";
import { GET_ERRORS } from "constants/errors";
import { toast } from 'react-toastify';

export const setMaterials = payload => {
  return {
    type: SET_MATERIALS,
    payload
  }
}

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload
  }
}

export const materialUpdateStart = () => {
  return {
    type: POST_UPDATE_MATERIAL_START
  }
}

export const materialUpdateEnd = payload => {
  return {
    type: POST_UPDATE_MATERIAL_END,
    payload
  }
}

export const materialUpdateError = payload => {
  return {
    type: POST_UPDATE_MATERIAL_ERROR,
    payload
  }
}

export const resetMaterialUpdate = () => {
  return { type: RESET_UPDATE_MATERIAL }
}

export const materialUpdateStartBulk = () => {
  return {
    type: POST_UPDATE_MATERIAL_START_BULK
  }
}

export const materialUpdateEndBulk = payload => {
  return {
    type: POST_UPDATE_MATERIAL_END_BULK,
    payload
  }
}

export const materialUpdateErrorBulk = payload => {
  return {
    type: POST_UPDATE_MATERIAL_ERROR_BULK,
    payload
  }
}

export const resetMaterialUpdateBulk = () => {
  return { type: RESET_UPDATE_MATERIAL_BULK }
}

export const statusUpdateStart = () => {
  return { type: UPDATE_MATERIAL_STATUS_START };
};

export const statusUpdateEnd = payload => {
  return {
    type: UPDATE_MATERIAL_STATUS_END,
    payload,
  };
};

export const statusUpdateError = payload => {
  return {
    type: UPDATE_MATERIAL_STATUS_ERROR,
    payload,
  };
};


export const fetchAllMaterials = () => {
  return async dispatch => {
    axios.get(ENDPOINTS.BM_MATERIALS)
    // .then(res => {
      //   dispatch(setMaterials(res.data))
      // })
      .then(res => {
        const updatedMaterials = res.data.map(material => ({
          ...material,
          stockAvailable: material.stockBought - material.stockUsed - material.stockWasted
        }));
        dispatch(setMaterials(updatedMaterials));
      })
      .catch(err => {
        dispatch(setErrors(err));
      });
  }
};



export const postMaterialUpdate = (payload) => {
  return async dispatch => {
    dispatch(materialUpdateStart())
    axios.post(ENDPOINTS.BM_UPDATE_MATERIAL, payload)
      .then(res => {
        dispatch(materialUpdateEnd(res.data))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(materialUpdateError(error.response.data));
        } else if (error.request) {
          dispatch(materialUpdateError(error.request));
        } else {
          dispatch(materialUpdateError(error));
        }
      })
  }
}

export const postMaterialUpdateBulk = (payload) => {
  return async dispatch => {
    dispatch(materialUpdateStartBulk())
    axios.post(ENDPOINTS.BM_UPDATE_MATERIAL_BULK, payload)
      .then(res => {
        dispatch(materialUpdateEndBulk(res.data.result))
      })
      .catch((error) => {
        if (error.response) {
          dispatch(materialUpdateErrorBulk(error.response.data));
        } else if (error.request) {
          dispatch(materialUpdateErrorBulk(error.request));
        } else {
          dispatch(materialUpdateErrorBulk(error));
        }
      })
  }
}

export const purchaseMaterial = async (body) => {
  return axios.post(ENDPOINTS.BM_MATERIALS, body)
    .then(res => res)
    .catch((err) => {
      if (err.response) return err.response
      if (err.request) return err.request
      return err.message
    })
}

export const approvePurchase = (purchaseId, quantity) => {
  return async dispatch => {
    dispatch(statusUpdateStart());
    try {
      const res = await axios.post(ENDPOINTS.BM_UPDATE_MATERIAL_STATUS, {
        purchaseId,
        status: 'Approved',
        quantity,
      });
      dispatch(statusUpdateEnd(res.data));
      toast.success('Item has been approved!', { toastId: 'approveSuccess' });
      dispatch(fetchAllMaterials());
      return res;
    } catch (error) {
      const errorPayload = error.response ? error.response.data : error.message;
      dispatch(statusUpdateError(errorPayload));
      toast.error('Failed to approve item.');
      return null;
    }
  };
};

export const rejectPurchase = purchaseId => {
  return async dispatch => {
    dispatch(statusUpdateStart());
    try {
      const res = await axios.post(ENDPOINTS.BM_UPDATE_MATERIAL_STATUS, {
        purchaseId,
        status: 'Rejected',
      });
      dispatch(statusUpdateEnd(res.data));
      toast.success('Item has been rejected!');
      dispatch(fetchAllMaterials());
      return res;
    } catch (error) {
      const errorPayload = error.response ? error.response.data : error.message;
      dispatch(statusUpdateError(errorPayload));
      toast.error('Failed to reject item.', { toastId: 'approveError' });
      return null;
    }
  };
};
