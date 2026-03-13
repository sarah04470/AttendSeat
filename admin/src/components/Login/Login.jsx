import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";
import { FilledInput, FormControl, InputAdornment } from "@mui/material";
import { Person, Lock } from "@mui/icons-material";
import '../../assets/css/members/login.css'

export default function Login() {
  const [values, setValues] = useState({ id: "", password: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("members/auth/login", {
        mem_userid: values.id,
        mem_password: values.password,
      });

      if (response.data.success) {
        const userData = response.data.data.user;

        dispatch(login({
          id: userData.mem_idx,
          name: userData.mem_name,
          auth: userData.mem_auth
        }));

        sessionStorage.setItem("ud", JSON.stringify({
          id: userData.mem_idx,
          name: userData.mem_name,
          auth: userData.mem_auth
        }));

        navigate("/");
      } else {
        alert(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      alert(error.response?.data?.error?.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-box">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-title">AttendSeat</div>
          <div className="login-subtitle">야자 좌석 관리 시스템</div>
          <FormControl sx={{ marginBottom: '16px', width: '100%' }} variant="standard">
            <FilledInput
              type="text"
              disableUnderline={true}
              startAdornment={
                <InputAdornment position="start" sx={{ mt: '0 !important', alignSelf: 'center' }}>
                  <Person sx={{ fontSize: 20, color: '#999' }} />
                </InputAdornment>
              }
              sx={{ alignItems: 'center', borderRadius: '8px', py: '2px' }}
              autoComplete="off"
              autoFocus={true}
              placeholder="아이디"
              name="id"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl sx={{ marginBottom: '24px', width: '100%' }} variant="standard">
            <FilledInput
              type="password"
              disableUnderline={true}
              startAdornment={
                <InputAdornment position="start" sx={{ mt: '0 !important', alignSelf: 'center' }}>
                  <Lock sx={{ fontSize: 20, color: '#999' }} />
                </InputAdornment>
              }
              sx={{ alignItems: 'center', borderRadius: '8px', py: '2px' }}
              autoComplete="off"
              placeholder="비밀번호"
              name="password"
              onChange={handleChange}
            />
          </FormControl>
          <button type="submit" className="login-btn">로그인</button>
        </form>
      </div>
    </div>
  );
}
