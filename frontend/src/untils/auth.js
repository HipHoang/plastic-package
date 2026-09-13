import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const getStoredAuth = () => {
  const localUser = localStorage.getItem("currentUser");
  const sessionUser = sessionStorage.getItem("currentUser");

  try {
    if (localUser) {
      return JSON.parse(localUser);
    }

    if (sessionUser) {
      return JSON.parse(sessionUser);
    }

    return null;
  } catch (error) {
    console.error("Lỗi đọc thông tin đăng nhập:", error);

    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    return null;
  }
};

export const setStoredAuth = (data, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  storage.setItem("currentUser", JSON.stringify(data));
  otherStorage.removeItem("currentUser");
};

export const clearStoredAuth = () => {
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("currentUser");

  window.location.href = "/";
};

export const getCurrentUser = () => {
  return getStoredAuth()?.user || null;
};

export const getCurrentUserId = () => {
  return getCurrentUser()?.id || getCurrentUser()?.user_id || null;
};

export const getAccessToken = () => {
  return getStoredAuth()?.access_token || null;
};

export const getCurrentToken = () => {
  return getAccessToken();
};

export const isLoggedIn = () => {
  return !!getAccessToken() && !!getCurrentUser();
};

export const isAdminRole = (role) => {
  return role === "admin" || role === "ADMIN";
};

export const isStaffRole = (role) => {
  return (
    role === "staff" ||
    role === "STAFF"
  );
};

export const isTeacherRole = (role) => {
  return isStaffRole(role);
};

export const isCustomerRole = (role) => {
  return role === "customer" || role === "CUSTOMER";
};


// ============================================================
// AXIOS INSTANCE
// ============================================================

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const token = getCurrentToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

apiClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const hasAuthorization =
      !!error.config?.headers?.Authorization;

    if (status === 401 && hasAuthorization) {
      clearStoredAuth();
    }

    return Promise.reject(error);
  }
);

export default apiClient;