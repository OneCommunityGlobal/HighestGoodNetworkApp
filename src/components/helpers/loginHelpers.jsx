import { api } from "../../services/api"

export const checkBackend = async () => {
    try {
        const response = await api.get(`/health`)
        return{ 
            status: "success", 
            message: "Backend is reachable",
            data: response.data 
        }
    } catch (error) {
        console.error("Error checking backend:", error)
        return{ 
            status: "error", 
            message: "Backend is not reachable",
            error: error.message
        }
    }
}

export const handleThreadsLogin = async () => {
    const response = await api.get(`/auth/threads/login`) 
    console.log("Threads login response:", response);
    window.open(response.data.data.url, "_blank", "width=600,height=600");

    window.addEventListener('message', async (event) => {
        if (event.data && event.data.status === 'success') {
            console.log("Threads login success:", event.data);
            await api.post(`/threads/updateSession`, {
                data: event.data
            })
            return {
                status: "success",
                message: "Logged in successfully.",
                data: event.data
            };
        }
    })

    
}

export const loadFacebookSDK = () => {
    return new Promise((resolve, reject) => {
        if (window.FB) {
            resolve(window.FB);
            return;
        }

        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onload = () => {
            window.fbAsyncInit = function fbAsyncInit() {
                window.FB.init({
                    appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                    cookie: true,
                    xfbml: true,
                    version: 'v23.0' // Use the latest version available
                });
                resolve(window.FB);
            };
        };
        script.onerror = error => {
            reject(error);
        };
        document.head.appendChild(script);
    })
}

export const handleFacebookLogin = () => {
    return new Promise((resolve, reject) => {
        window.FB.login(
            response => {
                if (response.authResponse) {
                    console.log("FB login response:", response);
                    api.post(`/auth/facebook/callback`, {
                        data: response.authResponse
                    })
                    .then(callbackResponse => {
                        resolve(callbackResponse.data);
                    })
                    .catch(error => {
                        resolve({
                            status: "error",
                            message: error.response?.data?.message || "An error occurred during login."
                        })
                    });
                    
                } else {
                    resolve({
                        status: "error",
                        message: "User cancelled login or did not fully authorize."
                    });
                }
            },
            {
                scope: 'public_profile,email,pages_read_engagement,pages_show_list,pages_manage_posts,instagram_basic,instagram_content_publish,business_management',
                auth_type: 'rerequest'
            },
        );
    })
    
}

export const getFacebookAuthStatus = () => {
    return new Promise((resolve, reject) => {
        api.get(`/auth/facebook/status`)
        .then(response => {
            console.log("FB auth status response:", response);
            resolve(response.data);
        })
        .catch(error => {
            resolve({
                status: "error",
                message: error.response?.data?.message || "An error occurred while checking login status."
            });
        })
    })
}

export const handleFacebookLogout = () => {
    return new Promise((resolve, reject) => {
        window.FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                window.FB.logout((response) => {
                    console.log("FB logout response:", response);
                    clearBackendSession(resolve);
                });
            } else {
                clearBackendSession(resolve);
            }
        });
    });
};

// Helper function to clear backend session
const clearBackendSession = (resolve) => {
    api.post(`/auth/facebook/disconnect`)
    .then(callbackResponse => {
        if (callbackResponse.data.status === "success") {
            resolve({
                status: "success",
                message: "Logged out successfully."
            });
        } else {
            resolve({
                status: "error",
                message: callbackResponse.data.message || "Failed to clear session on backend."
            });
        }
        
    })
    .catch(error => {
        console.warn("Backend logout failed:", error);
        resolve({
            status: "error",
            message: "Failed to clear session on backend."
        });
    });
};
