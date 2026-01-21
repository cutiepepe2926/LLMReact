import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css'; //

function Login() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
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
          <Link to="/signup" className="signup-link">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;