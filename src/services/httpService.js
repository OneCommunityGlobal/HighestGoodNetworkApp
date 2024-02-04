import axios from 'axios';
import { toast } from 'react-toastify';
import logService from './logService';

axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.response.use(null, error => {
  if (!(error.response && error.response.status >= 400 && error.response.status <= 500)) {
    logService.logError(error);
    toast.error('Unexpected error');
  }
  return Promise.reject(error);
});

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
