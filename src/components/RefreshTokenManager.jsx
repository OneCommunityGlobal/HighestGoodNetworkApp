import axios from "axios"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import httpService from "services/httpService";
import { ENDPOINTS } from "utils/URL";
import { logoutUser } from "actions/authActions";

const SECOND = 1000;

const useRefreshToken = async () => {

    const res = await axios.post(ENDPOINTS.REFRESH_TOKEN(), {
        refreshToken: JSON.parse(localStorage.getItem('refreshToken')).token
    })

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('refreshToken', JSON.stringify(res.data.refreshToken))
    httpService.setjwt(res.data.token)

}

const onLoop = async (dispatch) => {
        
    const base64AccessToken = localStorage.getItem('token');
    if(!base64AccessToken) return;
  
    const splits = base64AccessToken.split('.');
  
    const payloadString = Buffer.from(splits[1], 'base64').toString('utf-8')
    const payload = JSON.parse(payloadString);
  
    const accessTokenExpirationDate = new Date(payload.exp * SECOND);
    const currentDate = new Date();
    const isAccessTokenExpired = (accessTokenExpirationDate.valueOf() - currentDate.valueOf() <= 60 * SECOND);
  
    if(isAccessTokenExpired) {
      try {
        await useRefreshToken();
      } catch (err) {
        alert('An error occurred that forced us to log you out. If the problem persists, please contact technical support.')
        logoutUser()(dispatch)
        return;
      }
    }
  
}

/**
 * Automat
 * @returns 
 */
const RefreshTokenManager = () => {

    const [loopInterval, setLoopInterval] = useState(setInterval(() => onLoop(dispatch), 15 * SECOND))
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            clearInterval(loopInterval);
        }
    }, [])

    return (
        <>
        </>
    )

}

export default RefreshTokenManager