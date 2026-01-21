import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

function MyPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const navigate = useNavigate();

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="content-section">
                        <h3>프로필 정보</h3>
                        <div className="profile-header">
                            <div className="profile-img-large">
                                <img src="/img/Profile.svg" alt="Profile" />
                            </div>
                            <div className="profile-info-text">
                                <span className="user-name">사용자 이름</span>
                                <span className="user-email">user@example.com</span>
                            </div>
                            <button className="btn-edit" onClick={() => navigate('/modProfile')}>프로필 편집</button>
                        </div>
                        
                        <div className="form-group">
                            <label>닉네임</label>
                            <input type="text" defaultValue="홍길동" readOnly />
                        </div>
                        <div className="form-group">
                            <label>아이디</label>
                            <input type="text" defaultValue="hongilDong1234" readOnly />
                        </div>
                        <div className="form-group">
                            <label>이메일</label>
                            <input type="email" defaultValue="user@example.com" readOnly />
                        </div>
                        <div className="form-group">
                            <label>가입일</label>
                            <input type="text" placeholder="2026-01-01" readOnly />
                        </div>
                        <div className="github-oauth">
                            <label>GitHub 연동</label>
                            <img src="/img/githubOauth.png" className="github-button" alt="GitHub 연동 버튼"/>
                        </div>
                    </div>
                );
            case 'account':
                return (
                    <div className="content-section">
                        <h3>계정 설정</h3>
                        <div className="form-group">
                            <label>비밀번호 변경</label>
                            <input type="password" placeholder="새 비밀번호" />
                            <input type="password" placeholder="새 비밀번호 확인" style={{marginTop: '10px'}}/>
                            <button className="btn-save" style={{marginTop: '10px'}}>변경하기</button>
                        </div>
                        <div className="divider"></div>
                        <div className="delete-account">
                            <h4>계정 탈퇴</h4>
                            <p>계정을 삭제하면 모든 데이터가 사라집니다.</p>
                            <button className="btn-danger">회원 탈퇴</button>
                        </div>
                    </div>
                );
            // 필요에 따라 탭 추가 가능
            default:
                return null;
        }
    };

    return (
        <div className="mypage-container">
            <div className="mypage-sidebar">
                <h2>마이 페이지</h2>
                <ul className="sidebar-menu">
                    <li 
                        className={activeTab === 'profile' ? 'active' : ''} 
                        onClick={() => setActiveTab('profile')}
                    >
                        프로필 정보
                    </li>
                    <li 
                        className={activeTab === 'account' ? 'active' : ''} 
                        onClick={() => setActiveTab('account')}
                    >
                        계정 설정
                    </li>
                    <li onClick={() => alert('준비 중입니다.')}>내 프로젝트</li>
                    <li onClick={() => alert('로그아웃 되었습니다.')}>로그아웃</li>
                </ul>
            </div>
            
            <div className="mypage-content">
                {renderContent()}
            </div>
        </div>
    );
}

export default MyPage;