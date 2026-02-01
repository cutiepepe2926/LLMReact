import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../utils/api'; // 경로는 프로젝트 구조에 맞게
import './TaskCreateModal.css';

const TaskCreateModal = ({ onClose, onSave, initialData, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        endDate: '',
        content: '',
        priority: 2, // 기본값 중(2)
        branch: '',
        assigneeIds: [],
    });

    const [projectMembers, setProjectMembers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // 드롭다운 외부 클릭 감지용
    const dropdownRef = useRef(null);

    // 1. 초기 데이터 및 멤버 로드
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // 프로젝트 정보에서 멤버 리스트를 가져온다고 가정
                const res = await api.get(`/api/projects/${projectId}`);
                setProjectMembers(res.members || []); 
            } catch (e) {
                console.error("멤버 로딩 실패", e);
            }
        };
        fetchMembers();

        if (initialData) {
            setFormData({
                title: initialData.title || '',
                endDate: initialData.dueDate || '',
                content: initialData.content || initialData.description || '',
                priority: initialData.priority || 2,
                branch: initialData.branch || '',
                assigneeIds: initialData.assigneeIds || []
            });
        }
    }, [initialData, projectId]);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 담당자 선택 토글
    const toggleAssignee = (userId) => {
        setFormData(prev => {
            const exists = prev.assigneeIds.includes(userId);
            return {
                ...prev,
                assigneeIds: exists 
                    ? prev.assigneeIds.filter(id => id !== userId)
                    : [...prev.assigneeIds, userId]
            };
        });
        setSearchTerm(''); // 선택 후 검색어 초기화
    };

    // 선택된 멤버 제거 (태그의 x 버튼)
    const removeAssignee = (userId) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.filter(id => id !== userId)
        }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return alert("업무명을 입력해주세요.");
        
        const requestDTO = {
            title: formData.title,
            content: formData.content,
            priority: parseInt(formData.priority),
            branch: formData.branch,
            dueDate: formData.endDate,
            assigneeIds: formData.assigneeIds,
            status: initialData ? initialData.status : 'TODO'
        };
        onSave(requestDTO);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in-up">
                {/* 헤더 */}
                <div className="modal-header">
                    <h2>{initialData ? '업무 수정' : '새 업무 만들기'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* 바디 (스크롤 영역) */}
                <div className="modal-body">
                    <div className="form-group">
                        <label>업무명 <span style={{color:'red'}}>*</span></label>
                        <input 
                            type="text" 
                            name="title" 
                            placeholder="할 일을 입력하세요"
                            value={formData.title} 
                            onChange={handleChange} 
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>담당자 배정</label>
                        <div className="member-selector-container" ref={dropdownRef}>
                            <input 
                                type="text" 
                                placeholder="멤버 이름 검색..." 
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value); 
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            {/* 드롭다운 메뉴 */}
                            {isDropdownOpen && (
                                <div className="member-dropdown">
                                    {projectMembers
                                        .filter(m => m.name.includes(searchTerm) || m.userId.includes(searchTerm))
                                        .map(member => (
                                            <div 
                                                key={member.userId} 
                                                className={`member-option ${formData.assigneeIds.includes(member.userId) ? 'selected' : ''}`}
                                                onClick={() => toggleAssignee(member.userId)}
                                            >
                                                {/* 이미지가 없으면 기본 아이콘 처리 */}
                                                <img src={member.filePath || "/img/Profile.svg"} alt="profile" />
                                                <span>{member.name} ({member.userId})</span>
                                                {formData.assigneeIds.includes(member.userId) && <span className="check">✓</span>}
                                            </div>
                                    ))}
                                    {projectMembers.filter(m => m.name.includes(searchTerm)).length === 0 && (
                                        <div style={{padding:'10px', textAlign:'center', color:'#999'}}>검색 결과 없음</div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* 선택된 담당자 태그 노출 */}
                        <div className="selected-tags">
                            {formData.assigneeIds.map(id => {
                                const member = projectMembers.find(m => m.userId === id);
                                return (
                                    <span key={id} className="user-tag">
                                        {member ? member.name : id}
                                        <button type="button" onClick={() => removeAssignee(id)}>×</button>
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>우선순위</label>
                        <div className="radio-group">
                            {[3, 2, 1].map(p => (
                                <label key={p} className="radio-label">
                                    <input 
                                        type="radio" 
                                        name="priority" 
                                        value={p} 
                                        checked={parseInt(formData.priority) === p} 
                                        onChange={handleChange} 
                                    />
                                    {p === 3 ? '🔴 높음' : p === 2 ? '🟡 중간' : '🟢 낮음'}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>마감일</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>브랜치</label>
                        <input type="text" name="branch" placeholder="feature/login" value={formData.branch} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <textarea name="content" placeholder="상세 내용을 입력하세요" value={formData.content} onChange={handleChange} />
                    </div>
                </div>

                {/* 푸터 (하단 고정) */}
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="submit-btn" onClick={handleSubmit}>저장하기</button>
                </div>
            </div>
        </div>
    );
};

export default TaskCreateModal;