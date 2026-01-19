import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // 여기에 로그인 처리 로직을 작성하세요 (예: API 호출)
    console.log('Login attempt:', id, password);
  };

  return (
    <div className="login-page">
      <div className="login-container">
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
          {/* 회원가입 페이지 경로가 /regist라고 가정했습니다 */}
          <Link to="/regist" className="regist-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;