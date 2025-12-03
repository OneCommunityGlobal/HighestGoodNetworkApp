import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import {toast} from 'react-toastify';

export const CREATE_COLLABORATION_ADS_REQUEST = 'CREATE_COLLABORATION_ADS_REQUEST';
export const CREATE_COLLABORATION_ADS_SUCCESS = 'CREATE_COLLABORATION_ADS_SUCCESS';
export const CREATE_COLLABORATION_ADS_FAIL = 'CREATE_COLLABORATION_ADS_FAIL';

// eslint-disable-next-line import/prefer-default-export
export const createCollaborationAds = (formData) => async (dispatch) => {

  try {
    dispatch({ type: CREATE_COLLABORATION_ADS_REQUEST });
    const response =  await axios.post(`${ENDPOINTS.JOBS}`, formData);
   
    dispatch({
      type: 'CREATE_COLLABORATION_ADS_SUCCESS',
      payload: response.data, // You can also use formData directly
    });

              if (response.status === 200 || response.status === 201) 
                toast.success('Collaboration Ads created successfully!');
              }
            catch(error) {
                toast.error('Error updating the details. Please try again.');
            dispatch({ type: 'CREATE_COLLABORATION_ADS_FAIL' });
              
   
               if (error.response?.status === 500) {
      toast.error('Error updating the details. Please try again.');
    }
    else { toast.error('Error updating the details. Please try again.'); }
  }
};

