import { api } from "../../services/api"

export const getThreadsAccount = () => {
    return new Promise((resolve, reject) => {
        api.get('/threads')
        .then(response => {
            console.log("Threads accounts response:", response.data);
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while fetching Threads accounts."
            });
        })
    })
}

export const postThreads = (accountId, body) => {
    return new Promise((resolve, reject) => {
        api.post(`/threads/post`, body)
        .then(response => {
            console.log("Threads post response:", response.data);
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while posting to Threads account."
            });
        })
    })
}