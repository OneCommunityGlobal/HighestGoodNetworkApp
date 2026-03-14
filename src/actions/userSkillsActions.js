import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import {toast} from 'react-toastify';

// eslint-disable-next-line import/prefer-default-export
export const updateFollowUpFields = (userId,formData) => async (dispatch) => {

  try {
    // eslint-disable-next-line no-console
    console.log("{ENDPOINTS.HGN_FORM_UPDATE_USER_SKILLS_FOLLOWUP_SUBMIT}/{userId}");    
    // eslint-disable-next-line no-console
    console.log(`${ENDPOINTS.HGN_FORM_UPDATE_USER_SKILLS_FOLLOWUP_SUBMIT}${userId}`);
    const response = await axios.put(`${ENDPOINTS.HGN_FORM_UPDATE_USER_SKILLS_FOLLOWUP_SUBMIT}${userId}`, formData);

    dispatch({
      type: 'UPDATE_USER_SKILLS_PROFILE_DATA_FOLLOWUP_FIELDS_SUCCESS',
      payload: response.data, // You can also use formData directly
    });

              if (response.status === 200 || response.status === 201) 
                toast.success('Work Experience and Additional Information updated successfully!');
              }
            catch(error) {
                toast.error('Error updating the details. Please try again.');
            dispatch({ type: 'UPDATE_USER_SKILLS_PROFILE_DATA_FOLLOWUP_FIELDS_FAIL' });
              
   
               if (error.response?.status === 500) {
      toast.error('Error updating the details. Please try again.');
    }
  }
    


  
};

