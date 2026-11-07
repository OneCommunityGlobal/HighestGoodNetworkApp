import axios from 'axios';

let serverTime = null;

export const fetchServerTime = async () => {
  const response = await axios.get('/api/servertime');
  serverTime = response.data.serverTime;
  return serverTime;
};

export const getServerMoment = () => {
  return serverTime ? serverTime : new Date();
};