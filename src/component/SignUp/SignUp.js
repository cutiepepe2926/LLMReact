import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './SignUp.css';
import { api } from "../../utils/api";

function SignUp() {
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [confirmError, setConfirmError] = useState(false);

  const passwordConfirmRef = useRef(null);

  const validateEmail = (email) => {
    // 일반적인 이메일 형식 (example@domain.com) 검사 정규식
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // 이메일이 입력되어 있고(&&), 유효성 검사를 통과하지 못했을 때 true
  const isEmailInvalid = email.length > 0 && !validateEmail(email);

  // 비밀번호 유효성 검사 함수 (정규식)
  const validatePassword = (pwd) => {
    // lint 에러로 수정
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩]{8,16}$/;
    //const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩])[A-Za-z\d!\"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~₩]{8,16}$/;
    return regex.test(pwd);
  };

  // 비밀번호가 입력되어 있고(&&), 유효성 검사를 통과하지 못했을 때(!valid) true
  const isPasswordInvalid = password.length > 0 && !validatePassword(password);

  const handleSignUp =  async (e) => {
    e.preventDefault();

    if (isEmailInvalid) {
        alert('올바른 이메일 형식을 입력해주세요.');
        return;
    }

    if (isPasswordInvalid) {
        alert('비밀번호는 영문 대/소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.');
        return;
    }

    if (password !== passwordConfirm) {
        setConfirmError(true); // 에러 상태 활성화 (빨간 테두리 + 문구 표시)
        
        // 포커스 이동
        if (passwordConfirmRef.current) {
            passwordConfirmRef.current.focus();
        }
        return; // 가입 중단
    }

    // 검사 통과 시 에러 초기화
    setConfirmError(false);

    try{
      const inputData = {userId: id, email: email, password: password};
      const data = await api.post("/api/auth/signUp", inputData);

      if(data.success){
        alert("회원가입이 완료되었습니다");
        navigate('/login');
      }else{
        alert(data.message);
        console.log("실패 코드:", data.code); // DUP_EMAIL 등 확인 가능
      }
    }catch(error){
      console.error("네트워크 오류 발생: ", error);
      alert("서버 연결에 실패했습니다.");
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
                  className={`signup-input ${isEmailInvalid ? 'input-error' : ''}`}
                  required
              />

              {isEmailInvalid && (
                  <p className="input-feedback error">
                      이메일 형식이 올바르지 않습니다
                  </p>
              )}

              <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`signup-input ${isPasswordInvalid ? 'input-error' : ''}`}
                  required
              />
              <p className={`password-guide ${isPasswordInvalid ? 'guide-error' : ''}`}>
                • 8~16자의 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.<br/>
                • 사용 가능 특수문자: ! @ # $ % ^ & * ( ) 등
              </p>

              <input
                  type="password"
                  placeholder="비밀번호 확인"
                  value={passwordConfirm}
                  onChange={(e) => {
                      setPasswordConfirm(e.target.value);
                      if(confirmError) setConfirmError(false); // 입력시 에러 해제
                    }
                  }
                  className={`signup-input ${confirmError ? 'input-error' : ''}`}
                  ref={passwordConfirmRef}
                  required
              />

              {confirmError && (
                  <p className="input-feedback error">
                      비밀번호를 확인해주세요
                  </p>
              )}

              <button type="submit" className="signup-btn">
                가입하기
              </button>

              <div className="login-footer">
                <span>계정이 있으신가요? </span>
                {/* 여기 Link도 NavLink로 바꿔도 되고, 그냥 둬도 됨 */}
                <NavLink to="/login" className="login-link">
                  로그인
                </NavLink>
              </div>

            </form>
          </div>
        </div>
      </>
  );
}

export default SignUp;
