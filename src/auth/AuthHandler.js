import { useState, useEffect } from "react";
import { useNavigate, Outlet, Navigate } from "react-router-dom";
import { api } from "../utils/api"; // api.js 경로에 맞춰 수정하세요

function AuthHandler() {
  // 상태: null=검사중, true=성공, false=실패
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/validate");

        if (response) {
            setIsAuthenticated(true);
        } else {
            throw new Error("Invalid response");
        }

      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated === false) {
    return <Navigate to="/login" replace={true} />;
  }

  return <Outlet />;
}

export default AuthHandler;