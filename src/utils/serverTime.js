import axios from 'axios';
import moment from 'moment-timezone';
import { ENDPOINTS } from '~/utils/URL';

let serverTime = null;

export const fetchServerTime = async () => {
  const response = await axios.get(ENDPOINTS.SERVER_TIME);

  serverTime = response.data.serverTime;

  return response.data;
};

export const getServerMoment = () => {
  return serverTime
    ? moment.utc(serverTime).tz('America/Los_Angeles')
    : null;
};