import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';
import { api } from "../../utils/api";

function MyPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [userFullInfo, setUserFullInfo] = useState({
        name: '로딩 중....',
        userId: '로딩 중....',
        email: '로딩 중....',
        regDate: '로딩 중....',
        githubId: null
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try{
                const token = localStorage.getItem("accessToken");

                if(!token){
                    setUserFullInfo({name: 'unknown', email: 'unknown'});
                    return;
                }
                const jsonToken = {token: token};

                const data = await api.get(`/api/user/fullInfo`, jsonToken);
                
                console.log(data);
                
                if(data){
                    setUserFullInfo({
                        name: data.name,
                        userId: data.userId,
                        email: data.email,
                        regDate: data.regDate,
                        githubId: data.githubId
                    })
                }
                console.log(userFullInfo);
                
            }catch(error){
                console.error("사용자 정보를 불러오는데 실패했습니다.", error);    
            }
        };

        fetchUserInfo();
    }, []);

    const handleGithubConnect = () => {
        // 실제 백엔드 주소에 맞게 수정해주세요.
        // window.location.href = "http://localhost:8080/oauth2/authorization/github";
    };

    const formatDate = (dateString) => {
        if (!dateString || dateString === '로딩 중....') return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR'); // 한국 날짜 형식으로 자동 변환
    };

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
                                <span className="user-name">{userFullInfo.name}</span>
                                <span className="user-email">{userFullInfo.email}</span>
                            </div>
                            <button className="btn-edit" onClick={() => navigate('/modProfile')}>프로필 편집</button>
                        </div>
                        
                        <div className="form-group">
                            <label>닉네임</label>
                            <input type="text" value={userFullInfo.name} readOnly />
                        </div>
                        <div className="form-group">
                            <label>아이디</label>
                            <input type="text" value={userFullInfo.userId} readOnly />
                        </div>
                        <div className="form-group">
                            <label>이메일</label>
                            <input type="email" value={userFullInfo.email} readOnly />
                        </div>
                        <div className="form-group">
                            <label>가입일</label>
                            <input type="text" value={formatDate(userFullInfo.regDate)} readOnly />
                        </div>
                        <div className="github-oauth">
                            <label>GitHub 연동</label>
                            <div style={{marginTop: '10px'}}>
                                {userFullInfo.githubId ? (
                                    // 연동 되어 있을 때
                                    <span className="connected-text" style={{ color: 'green', fontWeight: 'bold' }}>
                                        Github 연동 완료
                                    </span>
                                ) : (
                                    // 연동 안 되어 있을 때 (이미지 클릭 시 이동)
                                    <img 
                                        src="/img/githubOauth.png" 
                                        className="github-button" 
                                        alt="GitHub 연동 버튼"
                                        onClick={handleGithubConnect}
                                        style={{ cursor: 'pointer' }}
                                    />
                                )}
                            </div>
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