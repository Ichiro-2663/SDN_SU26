import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post("http://localhost:9999/auth/login", {
        email,
        password,
      });

      const { user } = res.data;

      if (!user) {
        throw new Error("Login failed");
      }

      // lưu user
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("id", user._id);

      setUser(user);

      // redirect theo role
      const role = (user.role || "").toUpperCase();

      if (role === "ADMIN") navigate("/admin");
      else if (role === "TEACHER") navigate("/teacher");
      else navigate("/");

      return user;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("id");
    setUser(null);
    navigate("/");
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};