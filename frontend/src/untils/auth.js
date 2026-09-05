import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Điều chỉnh tùy theo URL backend của bạn

export const getStoredAuth = () => {
    const localUser = localStorage.getItem("currentUser");
    const sessionUser = sessionStorage.getItem("currentUser");
  
    return localUser || sessionUser
      ? JSON.parse(localUser || sessionUser)
      : null;
  };
  
export const setStoredAuth = (data, remember = true) => {
    if (remember) {
        localStorage.setItem("currentUser", JSON.stringify(data));
        sessionStorage.removeItem("currentUser");
    } else {
        sessionStorage.setItem("currentUser", JSON.stringify(data));
        localStorage.removeItem("currentUser");
    }
};
  
export const clearStoredAuth = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    window.location.href = '/'; // Đẩy về trang Home khi logout/hết hạn
};
  
export const getCurrentUser = () => {
    return getStoredAuth()?.user || null;
};
  
export const getCurrentUserId = () => {
    return getCurrentUser()?.id || null;
};
  
export const getAccessToken = () => {
    return getStoredAuth()?.access_token || null;
};
  
export const getCurrentToken = () => {
    return getAccessToken();
};
  
export const isLoggedIn = () => {
    return !!getCurrentUser();
};
  
export const isTeacherRole = (role) => {
    return role === "teacher" || role === "GiangVien" || role === "GV";
};

// Axios Instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = getCurrentToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Chỉ logout nếu request yêu cầu Auth (Authorization header) và bị 401
        if (error.response && error.response.status === 401 && error.config.headers['Authorization']) {
            clearStoredAuth();
        }
        return Promise.reject(error);
    }
);


export default apiClient;
