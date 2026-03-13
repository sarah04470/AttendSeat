import React, {useEffect, useState} from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../store/userSlice";
import api from "../api/axios";
import Dashboard from "../components/Dashboard/Dashboard.jsx";
import Login from "../components/Login/Login.jsx";
import StudentPage from "../components/Students/StudentPage.jsx";

// 중간관리자 이상 (mem_auth >= 8) - 학생정보 수정, 자리 이동/수정
function ManagerRoute({ children }) {
  const auth = useSelector((state) => state.user.userData.auth);
  const isLoggedIn = useSelector((state) => state.user.userData.loggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (auth < 8) return <Navigate to="/" replace />;
  return children;
}

// 슈퍼관리자 전용 (mem_auth >= 10) - 계정관리, 장소/좌석 CRUD, 모든 설정
function SuperRoute({ children }) {
  const auth = useSelector((state) => state.user.userData.auth);
  const isLoggedIn = useSelector((state) => state.user.userData.loggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (auth < 10) return <Navigate to="/" replace />;
  return children;
}

function AppRouterContent() {
  const dispatch = useDispatch();
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
      <Route element={<Dashboard />}>
        {/* 비로그인 - 조회, 출석체크 */}
        <Route index element={<div className="dash-board"><h2>AttendSeat 대시보드</h2><p style={{marginTop: 16, color: '#868686'}}>야자 좌석 관리 시스템</p></div>} />
        <Route path="attendance/daily" element={<div className="table-widget"><div className="table-title">일별 출석 현황</div><p>준비중</p></div>} />
        <Route path="attendance/seat-map" element={<div className="table-widget"><div className="table-title">좌석 배치도</div><p>준비중</p></div>} />
        <Route path="students/list" element={<StudentPage />} />

        {/* 중간관리자(8) - 자리이동/수정, 학생정보 수정 */}
        <Route path="students/edit/:id" element={<ManagerRoute><div className="table-widget"><div className="table-title">학생 정보 수정</div><p>준비중</p></div></ManagerRoute>} />
        <Route path="students/default-room" element={<ManagerRoute><div className="table-widget"><div className="table-title">기본 배정</div><p>준비중</p></div></ManagerRoute>} />
        <Route path="attendance/manage" element={<ManagerRoute><div className="table-widget"><div className="table-title">자리 이동/수정</div><p>준비중</p></div></ManagerRoute>} />

        {/* 슈퍼관리자(10) - 장소/좌석 CRUD, 계정관리, 모든 설정 */}
        <Route path="rooms/list" element={<SuperRoute><div className="table-widget"><div className="table-title">장소 목록</div><p>준비중</p></div></SuperRoute>} />
        <Route path="rooms/seats" element={<SuperRoute><div className="table-widget"><div className="table-title">좌석 관리</div><p>준비중</p></div></SuperRoute>} />
        <Route path="settings/members" element={<SuperRoute><div className="table-widget"><div className="table-title">관리자 계정</div><p>준비중</p></div></SuperRoute>} />
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
