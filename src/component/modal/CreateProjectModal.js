import React, { useState } from 'react';
import './CreateProjectModal.css';

const CreateProjectModal = ({ onClose, onCreate }) => {
  // 기본 입력 데이터 (isPrivate 제거됨)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '2026-01-01',
    endDate: '2026-01-13',
    reportTime: '09:00',
    repoUrl: '',
  });

  // 협업자 관리용 상태
  const [inviteInput, setInviteInput] = useState('');
  const [collaborators, setCollaborators] = useState([]);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 협업자 추가
  const handleAddCollaborator = () => {
    if (!inviteInput.trim()) return;
    if (collaborators.includes(inviteInput.trim())) {
      alert("이미 추가된 사용자입니다.");
      return;
    }
    setCollaborators([...collaborators, inviteInput.trim()]);
    setInviteInput('');
  };

  // 협업자 삭제
  const handleRemoveCollaborator = (target) => {
    setCollaborators(collaborators.filter(user => user !== target));
  };

  // 엔터키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddCollaborator();
  };

  // 유효성 검사
  const isFormValid = 
    formData.name.trim() !== '' &&
    formData.repoUrl.trim() !== '';

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in-up">
        
        <h2 className="modal-title">프로젝트 생성</h2>

        <div className="modal-body">
          {/* 1행: 이름 & 기간 */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 명</label>
              <input 
                type="text" 
                name="name" 
                placeholder="프로젝트 입니다" 
                onChange={handleChange} 
              />
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

          {/* 2행: 설명 & 리포트 시간 */}
          <div className="form-row">
            <div className="form-group flex-2">
              <label>프로젝트 설명</label>
              <textarea 
                name="description" 
                placeholder="프로젝트 설명입니다." 
                onChange={handleChange} 
              />
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

          {/* 3행: 깃허브 주소 */}
          <div className="form-group">
            <label>깃허브 주소</label>
            <div className="input-with-button">
              <input 
                type="text" 
                name="repoUrl" 
                placeholder="깃허브 URL을 입력해주세요" 
                onChange={handleChange} 
              />
              <button className="verify-btn">깃허브 연결하기</button>
            </div>
          </div>

          {/* 4행: 하단 영역 (협업자 + 버튼) */}
          <div className="bottom-section">
            
            {/* 왼쪽: 협업자 초대 */}
            <div className="left-panel">
              <label>협업자 초대</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  placeholder="ID 입력" 
                  value={inviteInput}
                  onChange={(e) => setInviteInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="add-btn" onClick={handleAddCollaborator}>추가</button>
              </div>
              
              <div className="collaborator-list">
                {collaborators.map((user, idx) => (
                  <span key={idx} className="user-tag">
                    👤 {user} <button onClick={() => handleRemoveCollaborator(user)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* 오른쪽: 버튼 그룹 (공개 범위 삭제됨 -> 하단 정렬) */}
            <div className="right-panel">
              <div className="button-group">
                <button className="cancel-btn" onClick={onClose}>취소</button>
                <button 
                  className="create-confirm-btn" 
                  onClick={() => onCreate({...formData, collaborators})}
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