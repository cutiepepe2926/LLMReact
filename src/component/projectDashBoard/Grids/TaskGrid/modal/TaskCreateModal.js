import React, { useState, useEffect, useRef } from 'react';
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

    const [projectMembers, setProjectMembers] = useState([]); 
    const [branches, setBranches] = useState([]); // 브랜치 목록
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const dropdownRef = useRef(null);
    const today = new Date().toISOString().split("T")[0];

    // 1. 초기 데이터, 멤버, 브랜치 로드
    useEffect(() => {
        if (!projectId) return;

        // (1) 멤버 조회
        const fetchMembers = async () => {
            try {
                const res = await api.get(`/api/projects/${projectId}/members/assignees`);
                setProjectMembers(Array.isArray(res) ? res : (res.data || []));
            } catch (e) {
                console.error("멤버 로딩 실패", e);
            }
        };

        // (2) 브랜치 조회
        const fetchBranches = async () => {
            try {
                // GithubController의 API 호출
                const res = await api.get(`/api/github/${projectId}/getBranch`);
                // 응답 형태에 따라 배열 추출
                const branchList = Array.isArray(res) ? res : (res.data || []);
                setBranches(branchList);
            } catch (e) {
                console.error("브랜치 로딩 실패:", e);
            }
        };

        fetchMembers();
        fetchBranches();

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
    };

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
                <div className="modal-header">
                    <h2>{initialData ? '업무 수정' : '새 업무 만들기'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>업무명 <span style={{color:'red'}}>*</span></label>
                        <input type="text" name="title" placeholder="할 일을 입력하세요" value={formData.title} onChange={handleChange} autoFocus />
                    </div>

                    <div className="form-group">
                        <label>담당자 배정</label>
                        <div className="member-selector-container" ref={dropdownRef}>
                            <input 
                                type="text" 
                                placeholder="담당자 이름 검색..." 
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
                                onFocus={() => setIsDropdownOpen(true)}
                            />
                            {isDropdownOpen && (
                                <div className="member-dropdown">
                                    {projectMembers.filter(m => (m.name?.includes(searchTerm) || m.userId?.includes(searchTerm))).map(member => {
                                        const isSelected = formData.assigneeIds.includes(member.userId);
                                        return (
                                            <div key={member.userId} className={`member-option ${isSelected ? 'selected' : ''}`} onClick={() => toggleAssignee(member.userId)}>
                                                <img src={member.filePath || "/img/Profile.svg"} alt="profile" onError={(e) => e.target.src = "/img/Profile.svg"} />
                                                <div className="member-info"><span className="name">{member.name}</span><span className="id">(@{member.userId})</span></div>
                                                {isSelected && <span className="check">✓</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                                    <input type="radio" name="priority" value={p} checked={parseInt(formData.priority) === p} onChange={handleChange} />
                                    {p === 3 ? '🔴 높음' : p === 2 ? '🟡 중간' : '🟢 낮음'}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>마감일</label>
                        <input type="date" name="endDate" value={formData.endDate} min={today} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>브랜치 연결</label>
                        <select 
                            name="branch" 
                            value={formData.branch} 
                            onChange={handleChange}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                        >
                            <option value="">연결할 브랜치 선택</option>
                            {branches.map((b, index) => (
                                <option key={index} value={b.name}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>설명</label>
                        <textarea name="content" placeholder="상세 내용을 입력하세요" value={formData.content} onChange={handleChange} />
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