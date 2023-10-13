import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
// eslint-disable-next-line import/prefer-default-export
export const getUserTimeZone = (location, key) => {
  const url = ENDPOINTS.GEOCODE_URI(location, key);
  return axios.get(`${url}`);
};
