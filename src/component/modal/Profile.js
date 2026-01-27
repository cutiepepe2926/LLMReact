import {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { api } from "../../utils/api";


const Profile = ({onClose}) => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: '로딩 중...',
    email: ''
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try{
        // 로컬 스토리지에서 userId 가져오기
        const token = localStorage.getItem("accessToken");

        if(!token){
          setUserInfo({name: 'unknown', email: 'unknown'});
          return;
        }

        // 백엔드 API 호출해서 사용자 정보 응답받기
        const jsonToken = {token: token};
        console.log(jsonToken);
        
        const data = await api.get(`/api/user/info`, jsonToken);

        if(data){
          setUserInfo({
            name: data.name,
            email: data.email
          });
        }
      }catch (error) {
        console.error("사용자 정보 조회 실패: ", error);
        setUserInfo({name: 'unknown', email: 'unknown'});
      }
    };

    fetchUserInfo();
  }, []);

  const handleMyPageClick = () => {
    navigate('/myPage');
    if (onClose) onClose();
  };

  const handleSettingsClick = () => {
    navigate('/modProfile'); // 프로필 수정 페이지 경로
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    alert("로그아웃 되었습니다.");
    onClose();
    navigate('/login');
  };
  
  return (
    <div className="profile-modal">
      <div className="profile-info">
        <img src="/img/Profile.svg" alt="User" className="profile-modal-img" />
        <div className="profile-text">
          <span className="profile-name">{userInfo.name}</span>
          <span className="profile-email">{userInfo.email}</span>
        </div>
      </div>
      <div className="profile-menu">
        <button className="profile-menu-item" onClick={handleMyPageClick}>마이 페이지</button>
        <button className="profile-menu-item" onClick={handleSettingsClick}>설정</button>
        <div className="divider"></div>
        <button className="profile-menu-item logout" onClick={handleLogout}>로그아웃</button>
      </div>
    </div>
  );
};

export default Profile;