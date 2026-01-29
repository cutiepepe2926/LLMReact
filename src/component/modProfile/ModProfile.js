import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ModProfile.css';
import { api } from "../../utils/api";

function ModProfile() {
    const navigate = useNavigate();

    // 초기값 상태 관리 (추후 API 연동 시 초기값으로 설정)
    const [userInfo, setUserInfo] = useState({
        nickname: '사용자 이름',
        email: 'user@example.com', // 이메일은 보통 수정 불가
        filePath: null
    });

    const [selectedFile, setSelectedFile] = useState(null); // 파일 상태 추가
    const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 URL

    useEffect(() => {
        const fetchUserInfo = async () => {
            try{
                const data = await api.get("/api/user/info");
                setUserInfo({
                    nickname: data.name,
                    email: data.email,
                    filePath: data.filePath
                });
            }catch(error){
                console.error("사용자 정보 로딩 실패: ", error);
                alert("사용자 정보를 불러오지 못했습니다");
            }
        };
        fetchUserInfo();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file); // 전송할 파일 객체 저장
            setPreviewUrl(URL.createObjectURL(file)); // 미리보기 URL 생성 (브라우저 메모리상)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo({
            ...userInfo,
            [name]: value
        });
    };

    const handleSave = async () => {
        // 유효성 검사 (예: 닉네임 비어있는지)
        if (!userInfo.nickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        try {
            // FormData 객체 생성 (파일 + 텍스트 전송용)
            const formData = new FormData();
            formData.append("nickname", userInfo.nickname);
            
            // 사용자가 파일을 새로 선택했을 때만 'file'을 추가
            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            // API 호출 (Multipart 요청은 api.js가 자동으로 처리하거나 Content-Type 설정 필요)
            // api.js의 post 메서드 사용
            await api.post("/api/user/profile", formData);

            alert('프로필이 수정되었습니다.');
            navigate('/myPage'); // 마이페이지로 복귀

        } catch (error) {
            console.error("수정 실패:", error);
            alert('프로필 수정 중 오류가 발생했습니다.');
        }
    };

    const handleCancel = () => {
        navigate(-1); // 뒤로 가기
    };

    // 화면에 표시할 이미지 결정 로직
    // 1순위: 방금 선택한 미리보기 (previewUrl)
    // 2순위: DB에서 가져온 기존 이미지 (userInfo.filePath)
    // 3순위: 기본 이미지 (/img/Profile.svg)
    const displayImage = previewUrl || userInfo.filePath || "/img/Profile.svg";

    return (
        <div className="mod-profile-container">
            <h3>프로필 수정</h3>
            
            <div className="mod-profile-content">
                {/* 프로필 이미지 수정 영역 */}
                <div className="profile-img-edit">
                    {/* 미리보기가 있으면 미리보기, 없으면 기존 이미지, 그것도 없으면 기본값 */}
                    <img 
                        src={displayImage} 
                        alt="Profile" 
                        className="current-img" 
                        style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover'}}
                    />
                    <label htmlFor="file-upload" className="camera-icon-wrapper">
                        {/* 카메라 아이콘 대용 (이미지가 있다면 img 태그로 교체 가능) */}
                        <div className="camera-icon">📷</div> 
                    </label>
                    <input 
                        type="file" 
                        id="file-upload" 
                        style={{ display: 'none' }} 
                        accept="image/*" // 이미지 파일만 선택 가능
                        onChange={handleFileChange} 
                    />
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
                            placeholder="닉네임을 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <label>이메일</label>
                        <input 
                            type="email" 
                            name="email"
                            value={userInfo.email} 
                            disabled 
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