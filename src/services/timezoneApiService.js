import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

const getUserTimeZone = (location, key) => {
  const url = ENDPOINTS.GEOCODE_URI(location, key);
  return axios.get(`${url}`);
};

export default getUserTimeZone;
