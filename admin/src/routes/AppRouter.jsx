import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../store/userSlice";
import api from "../api/axios";
import App from "../App.jsx";
import Login from "../components/Login/Login.jsx";

// 인증 보호 컴포넌트
function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector((state) => state.user.userData.loggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function AppRouterContent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const storedUserData = sessionStorage.getItem("ud");

      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          dispatch(login({ id: userData.id, name: userData.name, auth: userData.auth }));
        } catch (error) {
          sessionStorage.removeItem("ud");
        }
        setIsInitialized(true);
      } else {
        try {
          const response = await api.get('members/auth/me');
          if (response.data.success) {
            const userData = response.data.data.user;
            dispatch(login({ id: userData.mem_idx, name: userData.mem_name, auth: userData.mem_auth }));
            sessionStorage.setItem("ud", JSON.stringify({
              id: userData.mem_idx, name: userData.mem_name, auth: userData.mem_auth
            }));
          }
        } catch (error) {
          if (error.response?.status !== 401) console.error('[Auth] Error:', error);
        }
        setIsInitialized(true);
      }
    };
    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><App /></ProtectedRoute>}>
        <Route index element={<div>AttendSeat 관리자 대시보드 (준비중)</div>} />
      </Route>
    </Routes>
  );
}

function AppRouter() {
  return (
    <Router>
      <AppRouterContent />
    </Router>
  );
}

export default AppRouter;
