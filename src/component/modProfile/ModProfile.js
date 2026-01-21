import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModProfile.css';

function ModProfile() {
    const navigate = useNavigate();

    // 초기값 상태 관리 (추후 API 연동 시 초기값으로 설정)
    const [userInfo, setUserInfo] = useState({
        nickname: '사용자 이름',
        affiliation: '',
        email: 'user@example.com' // 이메일은 보통 수정 불가
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({
            ...userInfo,
            [name]: value
        });
    };

    const handleSave = () => {
        // 여기에 저장 API 호출 로직 추가
        alert('프로필이 수정되었습니다.');
        navigate('/myPage'); // 저장 후 마이페이지로 복귀
    };

    const handleCancel = () => {
        navigate(-1); // 뒤로 가기
    };

    return (
        <div className="mod-profile-container">
            <h3>프로필 수정</h3>
            
            <div className="mod-profile-content">
                {/* 프로필 이미지 수정 영역 */}
                <div className="profile-img-edit">
                    <img src="/img/Profile.svg" alt="Profile" className="current-img" />
                    <label htmlFor="file-upload" className="camera-icon-wrapper">
                        {/* 카메라 아이콘 대용 (이미지가 있다면 img 태그로 교체 가능) */}
                        <div className="camera-icon">📷</div> 
                    </label>
                    <input type="file" id="file-upload" style={{ display: 'none' }} />
                </div>

                {/* 입력 폼 영역 */}
                <div className="edit-form">
                    <div className="form-group">
                        <label>닉네임</label>
                        <input 
                            type="text" 
                            name="nickname"
                            value={userInfo.nickname} 
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>이메일</label>
                        <input 
                            type="email" 
                            name="email"
                            value={userInfo.email} 
                            disabled // 이메일 수정 불가 처리
                            className="input-disabled"
                        />
                    </div>
                </div>

                {/* 버튼 영역 */}
                <div className="button-group">
                    <button className="btn-cancel" onClick={handleCancel}>취소</button>
                    <button className="btn-save" onClick={handleSave}>저장완료</button>
                </div>
            </div>
        </div>
    );
}

export default ModProfile;