import axios from 'axios';

const baseURL = 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use(config => {
    const authTokens = localStorage.getItem('authTokens')
        ? JSON.parse(localStorage.getItem('authTokens'))
        : null;

    if (authTokens) {
        config.headers.Authorization = `Bearer ${authTokens.access}`;
    }
    return config;
}, error => Promise.reject(error));

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const authTokens = localStorage.getItem('authTokens')
                ? JSON.parse(localStorage.getItem('authTokens'))
                : null;

            if (!authTokens?.refresh) {
                localStorage.removeItem('authTokens');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${baseURL}/token/refresh/`, {
                    refresh: authTokens.refresh,
                });
                const newTokens = { ...authTokens, access: response.data.access };
                localStorage.setItem('authTokens', JSON.stringify(newTokens));
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                return axiosInstance(originalRequest);
            } catch {
                localStorage.removeItem('authTokens');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
