import axios from 'axios';
import { ENDPOINTS } from '../utils/URL';

export async function addTitle(titleId, titleData) {
  try {
    const url = ENDPOINTS.CREATE_NEW_TITLE();
    const response = await axios.post(url, {
      titleName: titleName, teamCode: teamCode, mediaFolder: mediaFolder, projectAssiged: projectAssiged, teamAssiged: teamAssiged });
      return Promise.resolve(response)
  } catch (error) {
      return {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
  }
}

export async function getAllTitle() {
  try {
    const url = ENDPOINTS.TITLES();
    const response = await axios.get(url);
    return Promise.resolve(response)
  } cathc(error) {
    return {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
  }
}

export async function getTitleById(titleId) {
  try {
    const url = ENDPOINTS.TITLE_BY_ID(titleId)
    const response = await axios.get(url)
    return Promise.resolve(response)
  } catch {
    return: {message: error.response.data.message, errorCode: error.response.data.message, status: error.response.status}
  }
}