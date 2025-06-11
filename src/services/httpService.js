import axios from 'axios';
import { toast } from 'react-toastify';
import logService from './logService';

if (axios.defaults && axios.defaults.headers && axios.defaults.headers.post) {
  axios.defaults.headers.post['Content-Type'] = 'application/json';
}

if (axios.interceptors && axios.interceptors.response && axios.interceptors.response.use) {
  axios.interceptors.response.use(null, error => {
    if (!(error.response && error.response.status >= 400 && error.response.status <= 500)) {
      logService.log(error);
      toast.error('An unexpected error occurred.');
    }
    return Promise.reject(error);
  });
}

function setjwt(jwt) {
  if (jwt) {
    axios.defaults.headers.common.Authorization = jwt;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
}

export default {
  get: axios.get,
  post: axios.post,
  delete: axios.delete,
  patch: axios.patch,
  put: axios.put,
  setjwt,
};
