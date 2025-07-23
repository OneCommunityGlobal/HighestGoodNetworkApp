import { api } from "../../services/api"

export const getFacebookPages = () => {
    return new Promise((resolve, reject) => {
        api.get(`/pages`)
        .then(response => {
            logResponse(response.data, "pages");
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while fetching Facebook pages."
            });
        })
    })
}

export const postLinkToFacebookPage = (pageId, body) => {
    return new Promise((resolve, reject) => {
        api.post(`/pages/post/link/${pageId}`, body)
        .then(response => {
            logResponse(response.data, "link");
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while posting link to Facebook page."
            });
        })
    })
}

export const postImageToFacebookPage = (pageId, body) => {
    return new Promise((resolve, reject) => {
        api.post(`/pages/post/image/${pageId}`, body)
        .then(response => {
            logResponse(response.data, "image");
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while posting image to Facebook page."
            });
        })
    })
}

function logResponse(response, text) {
    console.log(`FB ${text} response:`, response);
}