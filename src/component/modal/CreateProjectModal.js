import React, { useState, useEffect, useRef } from 'react';
import './CreateProjectModal.css';
import { api } from '../../utils/api';

const CreateProjectModal = ({ onClose, onCreate }) => {
  // 1. 기본 입력 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '2026-01-01',
    endDate: '2026-01-13',
    reportTime: '09:00',
    repoUrl: '',
  });

  // 2. 협업자 및 검색 관련 상태
  const [inviteInput, setInviteInput] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  // eslint-disable-next-line
  const [isSearching, setIsSearching] = useState(false);

  // 외부 클릭 감지를 위한 Ref
  const searchWrapperRef = useRef(null);

  // 3. 외부 클릭 시 드롭다운 닫기 (요구사항 1)
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target)) {
        setSearchResults([]); // 검색 결과 초기화 (드롭다운 닫기)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchWrapperRef]);

  // 4. 검색 로직 (0.5초 디바운스)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (inviteInput.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await api.get("/api/user/search", { keyword: inviteInput });
          const filteredResults = (res.data || res).filter(
            (user) => !collaborators.some((collab) => collab.userId === user.userId)
          );
          setSearchResults(filteredResults);
        } catch (error) {
          console.error("User search failed:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [inviteInput, collaborators]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCollaborator = (user) => {
    setCollaborators([...collaborators, user]);
    setInviteInput('');
    setSearchResults([]);
  };

  // 요구사항 3: X 버튼 동작 수정 (userId 기준 필터링)
  const handleRemoveCollaborator = (targetUserId) => {
    setCollaborators(collaborators.filter(user => user.userId !== targetUserId));
  };

  const handleCreate = () => {
    // 백엔드로 보낼 데이터 구성
    const requestData = {
      ...formData,
      // collaborators(객체 배열) -> memberIds(문자열 배열)로 변환
      // 백엔드는 userId만 필요함
      members: collaborators.map(member => member.userId)
    };
    
    onCreate(requestData);
  };

  const isFormValid = formData.name.trim() !== '' && formData.repoUrl.trim() !== '';
  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in-up">
        
        <h2 className="modal-title">프로젝트 생성</h2>

        <div className="modal-body">
          {/* ... 기존 상단 입력 폼 (이름, 날짜, 설명, 깃허브 등) 유지 ... */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 명</label>
              <input type="text" name="name" placeholder="프로젝트 입니다" onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>기간</label>
              <div className="date-display">
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
                <span>~</span>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 설명</label>
              <textarea name="description" placeholder="설명을 입력하세요" onChange={handleChange} />
            </div>
            <div className="form-group flex-1">
              <label>리포트 생성 시간</label>
              <select name="reportTime" value={formData.reportTime} onChange={handleChange}>
                <option value="09:00">09:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="18:00">06:00 PM</option>
                <option value="21:00">09:00 PM</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>깃허브 주소</label>
            <div className="input-with-button">
              <input type="text" name="repoUrl" placeholder="URL을 입력해주세요" onChange={handleChange} />
              <button className="verify-btn" type="button">깃허브 연결하기</button>
            </div>
          </div>

          {/* --- 요구사항 4: 하단 레이아웃 변경 (수직 배치) --- */}
          <div className="bottom-section">
            
            <label>협업자 초대</label>
            
            {/* 검색창 + 드롭다운 영역 (ref 추가) */}
            <div className="invite-input-group" ref={searchWrapperRef}> 
              <input 
                type="text" 
                value={inviteInput} 
                onChange={(e) => setInviteInput(e.target.value)} 
                placeholder="ID 또는 이름으로 검색"
                className="invite-input"
              />
              
              {/* 드롭다운 */}
              {searchResults.length > 0 && (
                <ul className="search-dropdown">
                  {searchResults.map((user) => (
                    <li 
                      key={user.userId} 
                      onClick={() => handleAddCollaborator(user)}
                      className="search-result-item"
                    >
                      {/* 요구사항 2: 기본 이미지 처리 */}
                      <img 
                        src={user.filePath || "/img/Profile.svg"} 
                        alt={user.name} 
                        className="user-avatar-small"
                      />
                      <div className="user-info-text">
                        <span className="user-name">{user.name}</span>
                        <span className="user-id">@{user.userId}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* 선택된 협업자 리스트 (검색창 아래 배치) */}
            <div className="collaborator-list">
              {collaborators.length === 0 && <span className="empty-msg">초대할 협업자가 없습니다.</span>}
              {collaborators.map((user, idx) => (
                <span key={idx} className="user-tag">
                  {/* 요구사항 2: 리스트에서도 기본 이미지 처리 */}
                  <img 
                    src={user.filePath || "/img/Profile.svg"} 
                    alt="profile" 
                    className="user-avatar-img" 
                  />
                  <span className="user-name">{user.name}</span>
                  
                  {/* 요구사항 3: type="button" 추가하여 폼 제출 방지 및 클릭 이벤트 수정 */}
                  <button 
                    type="button" 
                    className="remove-tag-btn" 
                    onClick={() => handleRemoveCollaborator(user.userId)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </span>
              ))}
            </div>

            {/* 오른쪽: 버튼 그룹 (공개 범위 삭제됨 -> 하단 정렬) */}
            {/*<div className="button-group">*/}
            <div className="right-panel">
              <div className="button-group">
                <button className="cancel-btn" onClick={onClose}>취소</button>
                <button 
                  className="create-confirm-btn" 
                  onClick={handleCreate}
                  disabled={!isFormValid}
                >
                  생성하기
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;