import React, { useState, useEffect } from 'react';
import { api } from '../../../../../utils/api';
import './TaskCreateModal.css';

const TaskCreateModal = ({ onClose, onSave, initialData, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        endDate: '', 
        content: '',
        priority: 2,
        branch: '',
        assigneeIds: [],
    });

    const [projectMembers, setProjectMembers] = useState([]); // 프로젝트 멤버 목록
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 1. 초기 데이터 세팅 및 프로젝트 멤버 로드
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                // 프로젝트 상세나 멤버 API에서 참여 인원 가져오기
                const res = await api.get(`/api/projects/${projectId}`);
                // API 구조에 따라 res.members 또는 res 자체일 수 있음
                setProjectMembers(res.members || []);
            } catch (e) {
                console.error("멤버 로딩 실패", e);
            }
        };
        fetchMembers();

        if (initialData) {
            setFormData({
                title: initialData.title || '',
                endDate: initialData.dueDate || '', // 백엔드 dueDate를 프론트 endDate로
                content: initialData.content || initialData.description || '',
                priority: initialData.priority || 2,
                branch: initialData.branch || '',
                assigneeIds: initialData.assigneeIds || []
            });
        }
    }, [initialData, projectId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 2. 담당자 토글 로직
    const toggleAssignee = (userId) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.includes(userId)
                ? prev.assigneeIds.filter(id => id !== userId)
                : [...prev.assigneeIds, userId]
        }));
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) return alert("업무명을 입력해주세요.");
        
        // 3. 백엔드 전송 DTO (dueDate로 이름 변경)
        const requestDTO = {
            title: formData.title,
            content: formData.content,
            priority: parseInt(formData.priority),
            branch: formData.branch,
            dueDate: formData.endDate, // 여기서 endDate를 dueDate로 매핑
            assigneeIds: formData.assigneeIds,
            status: initialData ? initialData.status : 'TODO'
        };
        onSave(requestDTO);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in-up">
                <div className="modal-header">
                    <h2>{initialData ? '업무 수정' : '업무 생성'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>업무명</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>마감일</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>담당자 배정</label>
                        <div className="member-selector-container">
                            <input 
                                type="text" 
                                placeholder="멤버 검색 및 선택..." 
                                value={searchTerm}
                                onChange={(e) => {setSearchTerm(e.target.value); setIsDropdownOpen(true);}}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            {isDropdownOpen && (
                                <div className="member-dropdown">
                                    {projectMembers
                                        .filter(m => m.name.includes(searchTerm))
                                        .map(member => (
                                            <div 
                                                key={member.userId} 
                                                className={`member-option ${formData.assigneeIds.includes(member.userId) ? 'selected' : ''}`}
                                                onClick={() => toggleAssignee(member.userId)}
                                            >
                                                <img src={member.filePath || "/img/Profile.svg"} alt="" />
                                                <span>{member.name} ({member.userId})</span>
                                                {formData.assigneeIds.includes(member.userId) && <span className="check">✓</span>}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="selected-tags">
                            {formData.assigneeIds.map(id => (
                                <span key={id} className="user-tag">
                                    {projectMembers.find(m => m.userId === id)?.name || id}
                                    <button onClick={() => toggleAssignee(id)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>업무 설명</label>
                        <textarea name="content" value={formData.content} onChange={handleChange} rows="4" />
                    </div>

                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>우선순위</label>
                            <div className="radio-group">
                                {[3, 2, 1].map(p => (
                                    <label key={p}>
                                        <input type="radio" name="priority" value={p} checked={parseInt(formData.priority) === p} onChange={handleChange} />
                                        {p === 3 ? '상' : p === 2 ? '중' : '하'}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>브랜치</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="submit-btn" onClick={handleSubmit}>저장하기</button>
                </div>
            </div>
        </div>
    );
};

export default TaskCreateModal;