import axios from "axios";
import Auth from "./Auth";
import Tools from "./Tools";
import constants from "../common/constants";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";


// Avoid sending custom headers by default (they force preflight and require server CORS changes)
const headers = {};

// Default to local backend; can be overridden with REACT_APP_API_URL
let baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

const Request = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: headers,
  // Do not send credentials (cookies) by default during local dev; enable if backend requires cookies
  withCredentials: false,
});
Request.defaults.withCredentials = false;


Request.interceptors.request.use(
  function (config) {
    if (!config.noAuth) {
      const access_token = Auth.getAccessToken();
      if (access_token) {
        config.headers.authorization = 'Bearer ' + access_token;
      }
    } else {
      delete config.headers.authorization;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

Request.interceptors.response.use(
    (response) => response,
    async (error) => {
        try {
            if (error.response && (error.response.status === 401)) {
                const originalRequest = error.config;

                if (originalRequest.noAuth) {
                    return Promise.reject(error);
                }

                // Check if this is a token refresh retry to avoid infinite loops
                if (!originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = Auth.getRefreshToken();
                        var refreshTokenURL = baseURL + constants.API_URLS.TOKEN_REFRESH_URL;
                        const tokenResponse = await axios.post(refreshTokenURL, {"refresh": refreshToken});

                        // Update access token in localStorage and headers
                        Auth.setAccessToken(tokenResponse.data.access);
                        Auth.setRefreshToken(tokenResponse.data.refresh);
                        // Request.defaults.headers.common['authorization'] = `Bearer ${tokenResponse.data.access}`;
                        // originalRequest.headers['authorization'] = `Bearer ${tokenResponse.data.access}`;
                        window.location.reload();
                        // Retry the original request with the new token
                        // return Request(originalRequest);

                    } catch (refreshError) {
                        console.error('Token refresh failed:', refreshError);
                        localStorage.clear();

                        Auth.resetAuthentication(); // will clear tokens and redirect
                        return Promise.reject(refreshError);
                    }
                }

                Auth.resetAuthentication();
            }

        } catch (err) {
            console.error('Error handling response:', err);
            toastr.error('An unexpected error occurred. Please try again.');
        }
        return Promise.reject(error);
    }
);


export default Request;