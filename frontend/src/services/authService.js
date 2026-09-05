import apiClient from "../untils/auth";

export const loginApi = async (payload) => {
  const res = await apiClient.post("/auth/login", payload);
  return res.data;
};

export const verifyTokenApi = async () => {
  const res = await apiClient.get("/auth/me");
  return res.data;
};

export const registerApi = async (payload) => {
  const res = await apiClient.post("/auth/register", payload);
  return res.data;
};

export const loginGoogleApi = async (token) => {
  const res = await apiClient.post("/auth/google", { token });
  return res.data;
};

export default apiClient;