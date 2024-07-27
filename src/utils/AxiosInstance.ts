import axios from 'axios'
import {checkAuthCookieExists, checkRefreshCookieExists} from "./Helper.ts";
import store from "../store/store.ts"
import {updateRefreshTokenStatus} from "../store/slice/refreshSlice.ts";

const axiosInstance = axios.create({
    withCredentials: true,
})

axiosInstance.interceptors.request.use(async req => {
    const authExists = checkAuthCookieExists()
    const refreshTokenExist = checkRefreshCookieExists()

    if (import.meta.env.MODE !== 'dev') {
        req.url = req.url?.replace('/api/', import.meta.env.VITE_BACKEND_URL);
    }

    const controller = new AbortController();
    req.signal = controller.signal

    if(authExists){
        return req
    }

    if(!refreshTokenExist){
        controller.abort('FE: Not Authorised');
        window.location.href = '/';
        return req
    }

    try {
        await axios.get(`${import.meta.env.VITE_BACKEND_URL}refreshToken`, {
            withCredentials: true
        });
    } catch(err) {
        if (axios.isAxiosError(err)) {
            if(err.response?.status == 401) {
                await axios.get(`${import.meta.env.VITE_BACKEND_URL}logout`, {
                    withCredentials: true
                })
                controller.abort('FE: Not Authorised');
                window.location.href = '/';
            }

        }
    }

    store.dispatch(updateRefreshTokenStatus({exist: true}))

    return req
})


axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {

            try {
                await axios.get(`${import.meta.env.VITE_BACKEND_URL}refreshToken`, {
                    withCredentials: true
                });
                store.dispatch(updateRefreshTokenStatus({exist: true}))
                originalRequest._retry = true;
                return axios(originalRequest)

            }
            catch(err) {
                if (axios.isAxiosError(err)) {
                    if(err.response?.status == 401) {
                        await axios.get(`${import.meta.env.VITE_BACKEND_URL}logout`, {
                            withCredentials: true
                        });
                    }
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/';
                }
            }

        }
        return Promise.reject(error)
    },
)


export default axiosInstance