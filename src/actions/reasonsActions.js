import axios from 'axios';
import { ENDPOINTS } from 'utils/URL';

export async function addReason(userId, reasonData) {
  try {
    const url = ENDPOINTS.CREATEREASON(userId);
    const response = await axios.post(url, { userId: userId, reasonData: reasonData });
    console.log(response);
    return Promise.resolve(response)
  } catch (error) {
    return {message: error.response.data.message, errorCode: error.response.data.message, httpCode: error.response.status}
  }
}
