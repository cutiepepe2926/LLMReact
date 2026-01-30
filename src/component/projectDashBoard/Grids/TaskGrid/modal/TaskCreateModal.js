import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../utils/api';
import './TaskCreateModal.css';

const TaskCreateModal = ({ onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        content: '',
        priority: 2, // 기본값: 중 (2)
        branch: '',
        assigneeIds: [], // 초기값 빈 배열
    });

    const [selectedAssignees, setSelectedAssignees] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // 수정 모드 초기 데이터 세팅
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                startDate: initialData.startDate || '',
                endDate: initialData.dueDate || '', // 백엔드 DTO 매핑 (dueDate)
                content: initialData.content || '',
                priority: initialData.priority || 2,
                branch: initialData.branch || '',
                assigneeIds: initialData.assigneeIds || []
            });
            // TODO: 수정 모드일 때 assigneeIds에 해당하는 유저 정보(이름 등)를 불러와서 selectedAssignees에 채워넣는 로직이 필요함.
            // 현재는 ID만 가지고 있어서 UI 표시에 한계가 있을 수 있음.
        }
    }, [initialData]);

    // 유저 검색
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchInput.trim()) {
                try {
                    const res = await api.get("/api/user/search", { keyword: searchInput });
                    setSearchResults(res || []);
                } catch (e) {
                    console.error("User search error:", e);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const handleAddAssignee = (user) => {
        // 중복 추가 방지
        if (!formData.assigneeIds.includes(user.userId)) {
            setFormData(prev => ({
                ...prev,
                assigneeIds: [...prev.assigneeIds, user.userId]
            }));
            setSelectedAssignees(prev => [...prev, user]);
        }
        setSearchInput('');
        setSearchResults([]);
    };

    const removeAssignee = (userId) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.filter(id => id !== userId)
        }));
        setSelectedAssignees(prev => prev.filter(u => u.userId !== userId));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            alert("업무명을 입력해주세요.");
            return;
        }
        
        // 백엔드 전송 DTO 구성
        const requestDTO = {
            title: formData.title,
            content: formData.content || formData.description,
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
                    <h2>{initialData ? '업무 수정' : '업무 생성'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="form-group">
                        <label>업무명</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="업무명을 입력하세요" />
                    </div>

                    <div className="form-group">
                        <label>마감일</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={{width: '100%'}} />
                    </div>

                    <div className="form-group">
                        <label>담당자</label>
                        <div className="assignee-input-box" style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input 
                                    type="text" 
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="이름으로 검색"
                                    style={{ width: '100%' }}
                                />
                                {searchResults.length > 0 && (
                                    <ul className="search-dropdown">
                                        {searchResults.map(user => (
                                            <li key={user.userId} onClick={() => handleAddAssignee(user)}>
                                                <img src={user.filePath || "/img/Profile.svg"} alt="" className="user-avatar-small"/>
                                                {user.name} ({user.userId})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <button type="button" className="add-btn">검색</button>
                        </div>
                        
                        <div className="assignee-tags">
                            {/* 선택된 담당자 (객체 정보 있음) */}
                            {selectedAssignees.map(user => (
                                <span key={user.userId} className="tag">
                                    {user.name} 
                                    <button type="button" onClick={() => removeAssignee(user.userId)}>×</button>
                                </span>
                            ))}
                            
                            {/* 수정 모드 등에서 ID만 있는 경우 안전하게 표시 */}
                            {(formData.assigneeIds || [])
                                .filter(id => !selectedAssignees.some(u => u.userId === id))
                                .map(id => (
                                    <span key={id} className="tag">
                                        {id} 
                                        <button type="button" onClick={() => removeAssignee(id)}>×</button>
                                    </span>
                                ))
                            }
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
                                <label><input type="radio" name="priority" value="3" checked={parseInt(formData.priority) === 3} onChange={handleChange} /> 상</label>
                                <label><input type="radio" name="priority" value="2" checked={parseInt(formData.priority) === 2} onChange={handleChange} /> 중</label>
                                <label><input type="radio" name="priority" value="1" checked={parseInt(formData.priority) === 1} onChange={handleChange} /> 하</label>
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>담당 브랜치</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="feature/xxx" />
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>취소</button>
                    <button className="submit-btn" onClick={handleSubmit}>
                        {initialData ? '수정 완료' : '생성하기'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskCreateModal;