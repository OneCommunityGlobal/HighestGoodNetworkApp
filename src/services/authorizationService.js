import httpService from './httpService';
import { ApiEndpoint } from '../utils/URL';

const forgotPassword = forgotpassworddata =>
  httpService.post(`${ApiEndpoint}/forgotpassword`, forgotpassworddata);

export default forgotPassword;
