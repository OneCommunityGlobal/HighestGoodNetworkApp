import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export async function addTitle(titleData) {
  try {
    const url = ENDPOINTS.CREATE_NEW_TITLE();
    const response = await axios.post(url, titleData);
    return Promise.resolve(response);
  } catch (error) {
    // Removed console.log as per no-console rule
    return {
      message: error.response?.data?.message || 'An error occurred',
      errorCode: error.response?.data?.message || 'Error',
      status: error.response?.status || 500,
    };
  }
}

export async function editTitle(titleData) {
  try {
    const url = ENDPOINTS.EDIT_OLD_TITLE();
    const response = await axios.post(url, titleData);
    return Promise.resolve(response);
  } catch (error) {
    // Removed console.log as per no-console rule
    return {
      message: error.response?.data?.message || 'An error occurred',
      errorCode: error.response?.data?.message || 'Error',
      status: error.response?.status || 500,
    };
  }
}

export async function getAllTitle() {
  try {
    const url = ENDPOINTS.TITLES();
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    // Removed console.log as per no-console rule
    return {
      message: error.response?.data?.message || 'An error occurred',
      errorCode: error.response?.data?.message || 'Error',
      status: error.response?.status || 500,
    };
  }
}

export async function getTitleById(titleId) {
  try {
    const url = ENDPOINTS.TITLE_BY_ID(titleId);
    const response = await axios.get(url);
    return Promise.resolve(response);
  } catch (error) {
    // Removed console.log and defined 'error' in catch
    return {
      message: error.response?.data?.message || 'An error occurred',
      errorCode: error.response?.data?.message || 'Error',
      status: error.response?.status || 500,
    };
  }
}

export async function deleteTitleById(titleId) {
  try {
    const url = ENDPOINTS.DELETE_TITLE_BY_ID(titleId);
    const response = await axios.put(url);
    return Promise.resolve(response);
  } catch (error) {
    // Removed console.log and defined 'error' in catch
    return {
      message: error.response?.data?.message || 'An error occurred',
      errorCode: error.response?.data?.message || 'Error',
      status: error.response?.status || 500,
    };
  }
}
