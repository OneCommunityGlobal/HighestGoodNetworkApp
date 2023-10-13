import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

// eslint-disable-next-line import/prefer-default-export
export const forgotPassword = forgotpassworddata =>
  httpService.post(`${ApiEndpoint}/forgotpassword`, forgotpassworddata);
