import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

export const forgotPassword = forgotpassworddata =>
  httpService.post(`${ApiEndpoint}/forgotpassword`, forgotpassworddata);
