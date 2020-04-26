import jwtDecode from 'jwt-decode';
import httpService from './httpService';
import config from '../config.json';

const loginApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/login`;

const { tokenKey } = config;

// export async function login(credentials) {
//   const { data } = await httpService.post(loginApiEndpoint, credentials);
//   if (data.new) {
//     return { userType: 'newUser', userId: data.userId };
//   }
//   localStorage.setItem(tokenKey, data.token);
// }

// export function logout() {
//   localStorage.removeItem(tokenKey);
// }

// export function getCurrentUser() {
//   return isUserAuthenticated()
//     ? jwtDecode(localStorage.getItem(tokenKey))
//     : null;
// }
// export function loginWithJWT(jwt) {
//   localStorage.setItem(tokenKey, jwt);
// }

// export function getjwt() {
//   return localStorage.getItem(tokenKey) ? localStorage.getItem(tokenKey) : null;
// }

// export function isUserAuthenticated() {
//   if (!localStorage.getItem(tokenKey)) {
//     return false;
//   }
//   const token = localStorage.getItem(tokenKey);
//   const { expiryTimestamp } = jwtDecode(token);
//   return expiryTimestamp > new Date().toISOString();
// }
