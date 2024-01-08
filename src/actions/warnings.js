import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';
import {
  getWarningByUserId,
  postWarningsByUserId,
  deleteWarningByUserId,
} from '../constants/warning';

export const getWarningsByUserId = userId => {
  const url = ENDPOINTS.GET_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    const res = await axios.get(url).catch(error => {
      console.log('errro occured', error);

      if (error.status === 401) {
      }
    });
    // console.log('res', res.data);
    const response = await dispatch(getWarningByUserId(res.data.warnings));
    // console.log('resoponse data', response);

    return response.payload;
  };
};

export const postWarningByUserId = warningData => {
  const { userId } = warningData;

  console.log('person id', userId);
  const url = ENDPOINTS.POST_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    // console.log('posting called');
    const res = await axios.post(url, warningData).catch(error => {
      console.log('error', error);
      if (error.status === 401) {
      }
    });

    //result if sucssful or not from backend

    const response = await dispatch(postWarningsByUserId(res.data));
    return response.payload;
  };
};

// export const deleteById = userId => {
//   const url = ENDPOINTS.DELETE_WARNINGS_BY_USER_ID(userId);

//   return async dispatch => {
//     // try {
//     const res = await axios.delete(url).catch(err => {
//       if (err.status === 401) {
//       }
//     });
//     console.log('dispatch occurred');
//     await dispatch(deleteWarningByUserId(res.data));
//     // } catch (error) {
//     // if (error.response && error.response.status === 401) {
//     // Handle unauthorized error
//     // }
//     // }
//   };
// };

export const deleteWarningsById = userId => {
  const url = ENDPOINTS.DELETE_WARNINGS_BY_USER_ID(userId);

  return async dispatch => {
    const res = await axios.delete(url).catch(err => {
      if (err.status === 401) {
      }
    });
    console.log('dispatch occured');
    await dispatch(deleteWarningByUserId(res.data));
  };
};
// export const deleteWarningsById = async userId => {
// console.log('user id', userId);

// const url = ENDPOINTS.DELETE_WARNINGS_BY_USER_ID(userId);
// return async dispatch => {
//   // console.log('posting called');
//   const res = await axios.delete(url).catch(error => {
//     if (error.status === 401) {
//     }
//   });
//   console.log('Ddispatchign');
//   await dispatch(deleteWarningByUserId(res.data));
// };
// };
