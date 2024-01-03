import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

export async function addReason(userId, reasonData) {
  try {
    const url = ENDPOINTS.CREATEREASON(userId);
    const response = await axios.post(url, { userId: userId, reasonData: reasonData });
    return Promise.resolve(response)
  } catch (error) {
    return {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
  }
}

export async function getReasonByDate(userId, queryDate){
    try {
        const url = ENDPOINTS.GETSINGLEREASONBYID(userId);
        const response = await axios.get(url, {params: {queryDate: queryDate }});
        return Promise.resolve(response)
      } catch (error) {
        return {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
      }
}

export async function patchReason(userId, reasonData) {
    try {
      const url = ENDPOINTS.PATCHUSERREASONBYID(userId);
      const response = await axios.patch(url, { userId: userId, reasonData: reasonData });
      return Promise.resolve(response)
    } catch (error) {
      return {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
    }
  }

  // gets all scheduled reasons
export async function getAllReasons(userId){
  try{
    const url = ENDPOINTS.GETALLUSERREASONS(userId);
    const response = await axios.get(url);
        return Promise.resolve(response)
  }catch(error){
    return {message: error.response.data.message, errorCode:error.response.data.message, status: error.repsonse.status}
  }
}