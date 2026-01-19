import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-modal">
      <div className="profile-info">
        <img src="/img/Profile.svg" alt="User" className="profile-modal-img" />
        <div className="profile-text">
          <span className="profile-name">사용자 이름</span>
          <span className="profile-email">user@example.com</span>
        </div>
      </div>
      <div className="profile-menu">
        <button className="profile-menu-item">마이 페이지</button>
        <button className="profile-menu-item">설정</button>
        <div className="divider"></div>
        <button className="profile-menu-item logout">로그아웃</button>
      </div>
    </div>
  );
};

export default Profile;