import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const APIEndPoint = `${ApiEndpoint}/userProfile`;

export const resetPassword = (userId, newpassworddata) => httpService.patch(`${APIEndPoint}/${userId}/resetPassword`, newpassworddata);
