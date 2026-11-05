import {ENHANCED_POPULARITY_DATA_REQUEST, ENHANCED_POPULARITY_DATA_SUCCESS, ENHANCED_POPULARITY_DATA_FAILURE,
  ENHANCED_POPULARITY_ROLES_REQUEST, ENHANCED_POPULARITY_ROLES_SUCCESS, ENHANCED_POPULARITY_ROLES_FAILURE
} from '../../constants/EnchanedPopularityAnalytics/EnchanedPopularityConstants';
import { ENDPOINTS } from '../../utils/URL';

export const fetchEnhancedPopularityData = ({ range, roles = [], includeLowVolume, token }) => async(dispatch) => {
    
    const url = ENDPOINTS.ENHANCED_POPULARITY(
      range,
      roles,
      null, // start (optional)
      null, // end (optional)
      includeLowVolume,
    );
  
    dispatch({type: ENHANCED_POPULARITY_DATA_REQUEST});
    
    try {
        const response = await fetch(url, {
          method: 'GET',  
          headers: {
                'Authorization': `${token}`
            }
        });
        const data = await response.json();

        if(!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        dispatch({type: ENHANCED_POPULARITY_DATA_SUCCESS, payload: data});
    } catch (error) {
        dispatch({type: ENHANCED_POPULARITY_DATA_FAILURE, payload: error.message});
    }
};

export const fetchEnhancedRoles = (token) => async(dispatch) => {
  dispatch({type: ENHANCED_POPULARITY_ROLES_REQUEST});
  try {
    const response = await fetch(ENDPOINTS.ENHANCED_POPULARITY_ROLES, {
      method: 'GET',  
      headers: {
            'Authorization': `${token}`
        }
    });
    const data = await response.json();

    if(!response.ok) {
      throw new Error(data.error || 'Failed to fetch data');
    }

    dispatch({type: ENHANCED_POPULARITY_ROLES_SUCCESS, payload: data});
  } catch (error) {
    dispatch({type: ENHANCED_POPULARITY_ROLES_FAILURE, payload: error.message});
  }
};
