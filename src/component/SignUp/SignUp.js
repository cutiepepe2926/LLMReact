import { useState } from 'react';
import './SignUp.css'; // 아래 작성할 CSS 파일 임포트

function SignUp() {
  // 각 입력 필드의 상태 관리
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 폼 제출 핸들러
  const handleSignUp = (e) => {
    e.preventDefault();
    // 여기에 회원가입 로직 추가 (예: API 호출)
    console.log('회원가입 시도:', { name, email, password, passwordConfirm });
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="logo-container">
            <img src="/img/Site_logo.svg" alt="로고" className="logo-img" />
        </div>
        
        <h2 className="signup-title">회원가입</h2>
        
        <form onSubmit={handleSignUp} className="signup-form">
          {/* 이름 입력 */}
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="signup-input"
            required
          />
          
          {/* 이메일 입력 */}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="signup-input"
            required
          />

          {/* 비밀번호 입력 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="signup-input"
            required
          />

          {/* 비밀번호 확인 입력 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="signup-input"
            required
          />
          
          {/* 가입하기 버튼 */}
          <button type="submit" className="signup-btn">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;