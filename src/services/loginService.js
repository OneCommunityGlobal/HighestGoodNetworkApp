import httpService from './httpervice'
import config from "../config.json"
import jwtDecode from 'jwt-decode'


const loginApiEndpoint = `https://hgn-rest-dev.herokuapp.com/api/login`; 
//const loginApiEndpoint = `${process.env.REACT_APP_APIENDPOINT}/login`; 

const tokenKey = config.tokenKey;

httpService.setjwt(getjwt())

export async function login(credentials)
{
  let {data} = await httpService.post(loginApiEndpoint, credentials)
  localStorage.setItem(tokenKey, data.token)  
  return;
}

export function logout ()
{
  localStorage.removeItem(tokenKey);
}

export function getCurrentUser()
{
  try{
    let token = localStorage.getItem(tokenKey)
    return jwtDecode(token)
  }
  catch(ex)
  {
    return null
  }
}
  export function loginWithJWT (jwt)
  {
    localStorage.setItem(tokenKey,jwt)
  }

  export function getjwt()
  {
    return localStorage.getItem(tokenKey)
  }

  export function isUserAuthenticated()
  {
    if (!localStorage.getItem('token')) {
        return false;
      }
      let token = localStorage.getItem('token');
      token = jwtDecode(token);
      return (token.expiryTimestamp > new Date().toISOString());
  
  }
  