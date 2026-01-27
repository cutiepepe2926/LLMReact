import { useState } from 'react';
import { NavLink } from 'react-router-dom';   // 변경: Link → NavLink
import './Login.css';
import { api } from "../../utils/api";


function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin =  async (e) => {
    e.preventDefault();

    try{
      const userData = { userId: id, password: password};
      const data = await api.post("/api/auth/logIn", userData); 

      console.log(data);
      

      if (data.success) {
        localStorage.setItem("accessToken", data.token);
        localStorage.setItem("userId", data.userId);
        alert(data.message);
      } else {
        alert(data.message);
      }

    }catch{

    }
  };

  const Icons = {
    LinkLogo: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#58A6FF" strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </svg>,
  };

  return (
      <>
        {/* Auth 전용 Nav (로그인/회원가입 공통) */}
        <header className="auth-header">
          <div className="auth-nav">
            {/* 좌측 로고 */}
            <NavLink to="/login" className="auth-logo" aria-label="홈으로">
              {/* 로고 이미지가 있으면 img로 교체해도 됨 */}
              {/* <img src="/img/Site_logo.svg" alt="사이트 로고" /> */}
              <div className="sidebar-brand">
                <Icons.LinkLogo />
                <span className="brand-name">LinkLogMate</span>
              </div>
            </NavLink>

            {/* 우측 버튼들 */}
            <nav className="auth-nav-right" aria-label="인증 메뉴">
              <NavLink
                  to="/login"
                  className={({ isActive }) => `auth-nav-link ${isActive ? 'active' : ''}`}
              >
                로그인
              </NavLink>

              <NavLink
                  to="/signup"
                  className={({ isActive }) => `auth-nav-link ${isActive ? 'active' : ''}`}
              >
                회원가입
              </NavLink>
            </nav>
          </div>
        </header>

        {/* 기존 Login 화면(거의 그대로) */}
        <div className="login-page">
          <div className="login-container">
            <img src="/img/Site_logo.svg" alt="로고" className="logo-img" />
            <h2 className="login-title">로그인</h2>

            <form onSubmit={handleLogin} className="login-form">
              <input
                  type="text"
                  placeholder="아이디"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="login-input"
              />
              <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="login-input"
              />

              <button type="submit" className="login-btn">
                로그인
              </button>
            </form>

            <div className="login-footer">
              <span>계정이 없으신가요? </span>
              {/* 여기 Link도 NavLink로 바꿔도 되고, 그냥 둬도 됨 */}
              <NavLink to="/signup" className="signup-link">
                회원가입
              </NavLink>
            </div>
          </div>
        </div>
      </>
  );
}

export default Login;
