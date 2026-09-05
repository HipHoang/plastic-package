import React, { createContext, useContext, useState, useEffect } from "react";
import { verifyTokenApi } from "../services/authService";
import { getAccessToken } from "../untils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearStoredAuth = () => {
    localStorage.clear();
    setUser(null);
  };

  useEffect(() => {
    const verify = async () => {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await verifyTokenApi();
        setUser(response.data);
      } catch (error) {
        clearStoredAuth();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, clearStoredAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
