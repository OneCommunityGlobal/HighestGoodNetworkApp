import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_APIENDPOINT || "http://localhost:4500"
export const api = axios.create({
    baseURL: `${API_ENDPOINT}/api`,
    withCredentials: true,
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            const redirectUrl = error.response.data.redirect || '/';

            window.location.href = redirectUrl;

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);