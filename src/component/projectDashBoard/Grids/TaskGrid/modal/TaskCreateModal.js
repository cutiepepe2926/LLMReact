import React, { useState, useEffect } from 'react';
import './TaskCreateModal.css';

const TaskCreateModal = ({ onClose, onSave, initialData }) => {
    // 폼 데이터 초기값 설정
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        description: '',
        priority: '중',
        branch: '',
        assignees: [], // 배열로 관리
    });

    const [assigneeInput, setAssigneeInput] = useState(''); // 담당자 입력용 임시 state

    // 수정 모드일 경우 초기 데이터 세팅
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // 날짜 포맷 등이 맞지 않을 경우 변환 로직 필요할 수 있음
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 담당자 추가 엔터키 처리
    const handleAddAssignee = () => {
        if (assigneeInput.trim() && !formData.assignees.includes(assigneeInput.trim())) {
            setFormData({
                ...formData,
                assignees: [...formData.assignees, assigneeInput.trim()]
            });
            setAssigneeInput('');
        }
    };

    // 담당자 삭제
    const removeAssignee = (name) => {
        setFormData({
            ...formData,
            assignees: formData.assignees.filter(a => a !== name)
        });
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            alert("업무명을 입력해주세요.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content fade-in-up">
                <div className="modal-header">
                    <h2>{initialData ? '업무 수정' : '업무 생성'}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* 업무명 */}
                    <div className="form-group">
                        <label>업무명</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="업무명을 입력하세요" />
                    </div>

                    {/* 기간 */}
                    <div className="form-group">
                        <label>기간</label>
                        <div className="date-range-input">
                            <input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} />
                            <span>~</span>
                            <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} />
                        </div>
                    </div>

                    {/* 담당자 (다중 추가 UI) */}
                    <div className="form-group">
                        <label>담당자</label>
                        <div className="assignee-input-box">
                            <input 
                                type="text" 
                                value={assigneeInput}
                                onChange={(e) => setAssigneeInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddAssignee()}
                                placeholder="이름 입력 후 엔터 또는 추가 버튼"
                            />
                            <button type="button" className="add-btn" onClick={handleAddAssignee}>추가</button>
                        </div>
                        <div className="assignee-tags">
                            {formData.assignees.map((user, idx) => (
                                <span key={idx} className="tag">
                                    {user} <button onClick={() => removeAssignee(user)}>×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* 설명 */}
                    <div className="form-group">
                        <label>업무 설명</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="4" />
                    </div>

                    {/* 우선순위 & 브랜치 */}
                    <div className="form-row">
                        <div className="form-group flex-1">
                            <label>우선순위</label>
                            <div className="radio-group">
                                {['상', '중', '하'].map(p => (
                                    <label key={p}>
                                        <input 
                                            type="radio" 
                                            name="priority" 
                                            value={p} 
                                            checked={formData.priority === p} 
                                            onChange={handleChange} 
                                        /> {p}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-group flex-1">
                            <label>담당 브랜치</label>
                            <div className="branch-input-group">
                                <span className="git-icon">🌱</span>
                                <input type="text" name="branch" value={formData.branch} onChange={handleChange} placeholder="feature/xxx" />
                            </div>
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