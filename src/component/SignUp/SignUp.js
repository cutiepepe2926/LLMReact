import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './SignUp.css';

function SignUp() {
  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    console.log('회원가입 시도:', { id, email, password, passwordConfirm });
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
        {/* Auth 전용 Nav (Login과 동일) */}
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

        {/* 기존 SignUp 화면 */}
        <div className="signup-page">
          <div className="signup-container">
            <div className="logo-container">
              <img src="/img/Site_logo.svg" alt="로고" className="logo-img" />
            </div>

            <h2 className="signup-title">회원가입</h2>

            <form onSubmit={handleSignUp} className="signup-form">
              <input
                  type="text"
                  placeholder="아이디"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="signup-input"
                  required
              />

              <input
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="signup-input"
                  required
              />

              <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="signup-input"
                  required
              />

              <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="signup-input"
                  required
              />

              <button type="submit" className="signup-btn">
                가입하기
              </button>
            </form>
          </div>
        </div>
      </>
  );
}

export default SignUp;
