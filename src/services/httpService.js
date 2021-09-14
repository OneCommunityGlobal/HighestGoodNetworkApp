import axios from 'axios';
import { toast } from 'react-toastify';
import logService from './logService';
import { tokenKey } from 'config.json'

/**
 * Sets the 
 * @param {*} jwt 
 */
const setjwt = (jwt) => {
  if (jwt){
    axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.response.use(null, (error) => {
  if (!(error.response && error.response.status >= 400 && error.response.status <= 500)) {
    logService.logError(error);
    toast.error('Unexpected error');
  }
  return Promise.reject(error);
});

axios.interceptors.request.use((config) => {
  const jwt = localStorage.getItem(tokenKey)
  if(!jwt) return config;
  setjwt(jwt)
  return config;
});

export default {
  get: axios.get,
  post: axios.post,
  delete: axios.delete,
  patch: axios.patch,
  put: axios.put,
  setjwt,
};
