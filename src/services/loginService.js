import httpService from "./httpervice";
import config from "../config.json";
import jwtDecode from "jwt-decode";

const loginApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/login`;

const tokenKey = config.tokenKey;

httpService.setjwt(getjwt());

export async function login(credentials) {
  let { data } = await httpService.post(loginApiEndpoint, credentials);
  if (!!data.new) {
    return { userType: "newUser", userId: data.userId };
  } else {
    localStorage.setItem(tokenKey, data.token);
    return;
  }
}

export function logout() {
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser() {
  return isUserAuthenticated()
    ? jwtDecode(localStorage.getItem(tokenKey))
    : null;
}
export function loginWithJWT(jwt) {
  localStorage.setItem(tokenKey, jwt);
}

export function getjwt() {
  return localStorage.getItem(tokenKey) ? localStorage.getItem(tokenKey) : null;
}

export function isUserAuthenticated() {
  if (!localStorage.getItem(tokenKey)) {
    return false;
  }
  let token = localStorage.getItem(tokenKey);
  let { expiryTimestamp } = jwtDecode(token);
  return expiryTimestamp > new Date().toISOString();
}
