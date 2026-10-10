import axios from 'axios';
import { toast } from 'react-toastify';
import { ENDPOINTS } from '../utils/URL';

export const CREATE_COLLABORATION_ADS_REQUEST = 'CREATE_COLLABORATION_ADS_REQUEST';
export const CREATE_COLLABORATION_ADS_SUCCESS = 'CREATE_COLLABORATION_ADS_SUCCESS';
export const CREATE_COLLABORATION_ADS_FAIL = 'CREATE_COLLABORATION_ADS_FAIL';

// eslint-disable-next-line import/prefer-default-export
export const createCollaborationAds = formData => async dispatch => {
  try {
    dispatch({ type: CREATE_COLLABORATION_ADS_REQUEST });
    const response = await axios.post(`${ENDPOINTS.JOBS}`, formData);

    dispatch({
      type: CREATE_COLLABORATION_ADS_SUCCESS,
      payload: response.data,
    });

    if (response.status === 200 || response.status === 201) {
      toast.success('Collaboration Ads created successfully!');
    }
  } catch (error) {
    dispatch({ type: CREATE_COLLABORATION_ADS_FAIL });
    toast.error(
      error.response?.data?.message || 'Error updating the details. Please try again.',
    );
  }
};
