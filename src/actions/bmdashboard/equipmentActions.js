import axios from 'axios';
import { toast } from 'react-toastify';
import { GET_EQUIPMENT_BY_ID, SET_EQUIPMENTS } from '../../constants/bmdashboard/equipmentConstants';
import { GET_ERRORS } from '../../constants/errors';
import { ENDPOINTS } from '~/utils/URL';

export const setEquipment = payload => {
  return {
    type: GET_EQUIPMENT_BY_ID,
    payload,
  };
};

export const setEquipments = payload => {
  return {
    type: SET_EQUIPMENTS,
    payload,
  };
};

export const setErrors = payload => {
  return {
    type: GET_ERRORS,
    payload,
  };
};

export const fetchEquipmentById = equipmentId => {
  const url = `${ENDPOINTS.BM_EQUIPMENT_BY_ID(equipmentId)}`;
  return async dispatch => {
    axios
      .get(url)
      .then(res => {
        dispatch(setEquipment(res.data));
      })
      .catch(error => {
        dispatch(setErrors(error));
      });
  };
};

export const fetchAllEquipments = (projectId = null) => async dispatch => {
  const url = projectId
    ? `${ENDPOINTS.BM_EQUIPMENTS}?project=${projectId}`
    : ENDPOINTS.BM_EQUIPMENTS;

  try {
    const res = await axios.get(url);
    dispatch(setEquipments(res.data));
  } catch (err) {
    dispatch(setErrors(err));
  }
};

export const addEquipmentType = async body => {
  return axios
    .post(`${ENDPOINTS.BM_INVTYPE_ROOT}/equipment`, body)
    .then(res => res)
    .catch(err => {
      if (err.response) return err.response;
      if (err.request) return err.request;
      return err.message;
    });
};

export const purchaseEquipment = async body => {
  return axios
    .post(ENDPOINTS.BM_EQUIPMENT_PURCHASE, body)
    .then(res => res)
    .catch(err => {
      if (err.response) return err.response;
      if (err.request) return err.request;
      return err.message;
    });
};

export const updateMultipleEquipmentLogs = (projectId, bulkArr) => dispatch => {
  axios
    .put(
      `${ENDPOINTS.BM_EQUIPMENT_LOGS}?project=${projectId}`,
      bulkArr
    )
    .then(res => {
      dispatch(setEquipments(res.data));
      toast.success('Equipment logs updated successfully!');
      return res.data;
    })
    .catch(err => {
      dispatch(setErrors(err));
      toast.error('Failed to update equipment logs.');
      throw err;
    });
}

export const updateEquipment = (equipmentId, updateData) => async (dispatch, getState) => {
  const url = `${ENDPOINTS.BM_EQUIPMENT_STATUS_UPDATE(equipmentId)}`;

  try {
    const state = getState();
    let currentUserId = state?.auth?.user?.userid;

    if (!currentUserId) {
      currentUserId = state?.auth?.user?._id ||
        state?.auth?.user?.id ||
        state?.auth?._id ||
        state?.auth?.id;
    }

    if (!currentUserId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        currentUserId = storedUserId;
      }
    }

    if (!currentUserId) {
      const errorMsg = 'User not authenticated. Please log in.';
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    const statusUpdateData = {
      condition: updateData.condition,
      lastUsedBy: updateData.lastUsedBy,
      lastUsedFor: updateData.lastUsedFor,
      replacementRequired: updateData.replacementRequired,
      description: updateData.description || '',
      notes: updateData.notes || '',
      createdBy: currentUserId,
    };

    const res = await axios.put(url, statusUpdateData);

    dispatch(setEquipment(res.data));
    toast.success('Equipment status updated successfully!');
    dispatch(fetchEquipmentById(equipmentId));

    return res.data;
  } catch (err) {

    let errorMessage = 'Failed to update equipment status.';

    if (err.response) {
      errorMessage = err.response.data?.error ||
        err.response.data?.message ||
        err.response.statusText ||
        errorMessage;
      dispatch(setErrors(err.response.data));
    } else if (err.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      errorMessage = err.message;
    }

    toast.error(errorMessage);
    throw err;
  }
};