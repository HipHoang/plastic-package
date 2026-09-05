import { getCurrentUserId } from "../untils/auth";

const getRawData = (key) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : {};
};

const saveRawData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  getUserData(key) {
    const userId = getCurrentUserId();
    if (!userId) return [];

    const all = getRawData(key);
    return all[userId] || [];
  },

  setUserData(key, value) {
    const userId = getCurrentUserId();
    if (!userId) return;

    const all = getRawData(key);
    all[userId] = value;
    saveRawData(key, all);
  },

  addUserItem(key, item) {
    const userId = getCurrentUserId();
    if (!userId) return;

    const all = getRawData(key);
    const currentList = all[userId] || [];

    all[userId] = [...currentList, item];
    saveRawData(key, all);
  },
};