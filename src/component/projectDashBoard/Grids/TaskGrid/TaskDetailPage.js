import React, { useState, useEffect } from 'react';
import { api } from '../../../../utils/api';
import './TaskDetailPage.css';

const TaskDetailPage = ({ projectId, task, onBack, onEdit, onDelete, onStatusChange }) => {
    const [checklist, setChecklist] = useState([]);
    const [chats, setChats] = useState([]);
    const [newCheckItem, setNewCheckItem] = useState('');
    const [newChat, setNewChat] = useState('');
    const [isAddingCheck, setIsAddingCheck] = useState(false);
    const [localTask, setLocalTask] = useState(task);

    // 상세 데이터 로딩
    useEffect(() => {
        const loadDetail = async () => {
            try {
                // 1. 업무 상세 조회
                const detailData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}`);
                setLocalTask(detailData);
                setChecklist(detailData.checkLists || []);
                
                // 2. 채팅 조회 (별도 API인 경우)
                const chatData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/chats`);
                setChats(chatData || []);
            } catch (e) {
                console.error("상세 조회 실패", e);
            }
        };
        loadDetail();
    }, [projectId, task.taskId]);

    // 체크리스트 추가
    const handleAddCheckItem = async () => {
        if (newCheckItem.trim()) {
            try {
                await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/checklists`, { content: newCheckItem });
                // 리로드 혹은 수동 추가
                setNewCheckItem('');
                setIsAddingCheck(false);
                // 간단하게 다시 불러오기
                const detailData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}`);
                setChecklist(detailData.checkLists || []);
            } catch (e) { alert("추가 실패"); }
        }
    };

    // 체크리스트 토글
    const toggleCheckItem = async (item) => {
        try {
            await api.patch(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${item.checkListId}`, { is_done: !item.status });
            setChecklist(prev => prev.map(c => c.checkListId === item.checkListId ? { ...c, status: !c.status } : c));
        } catch (e) { console.error(e); }
    };

    // 체크리스트 삭제
    const handleDeleteCheckItem = async (id) => {
        if(window.confirm("삭제하시겠습니까?")) {
            try {
                await api.delete(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${id}`);
                setChecklist(prev => prev.filter(c => c.checkListId !== id));
            } catch (e) { alert("삭제 실패"); }
        }
    };

    // 채팅 등록
    const handleAddChat = async () => {
        if (newChat.trim()) {
            try {
                await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/chats`, { content: newChat });
                setNewChat('');
                const chatData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/chats`);
                setChats(chatData);
            } catch (e) { alert("채팅 등록 실패"); }
        }
    };

    return (
        <div className="task-detail-page">
            <div className="detail-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onBack}>← 뒤로가기</button>
                    <span className="divider"></span>
                    <span className="task-key">TASK-{localTask.taskId}</span>
                    <h2 className="task-title">{localTask.title}</h2>
                </div>
                <div className="header-right">
                    <div className="action-buttons">
                        <button className="btn-action edit" onClick={onEdit}>수정</button>
                        <button className="btn-action delete" onClick={onDelete}>삭제</button>
                    </div>
                    <select 
                        className="status-select" 
                        value={localTask.status} 
                        onChange={(e) => onStatusChange(localTask.taskId, e.target.value)}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </div>

            <div className="detail-body">
                <div className="detail-panel left-panel">
                    <div className="info-card">
                        <h3 className="panel-title">기본 정보</h3>
                        <div className="info-item">
                            <label>담당자</label>
                            <div className="user-badge-list">
                                {localTask.assigneeIds && localTask.assigneeIds.map((uid, i) => (
                                    <span key={i} className="user-badge">{uid}</span>
                                ))}
                            </div>
                        </div>
                        <div className="info-item">
                            <label>마감일</label>
                            <div className="date-text">{localTask.dueDate || '미설정'}</div>
                        </div>
                        <div className="info-item">
                            <label>우선순위</label>
                            <span>{localTask.priority === 3 ? '상' : localTask.priority === 2 ? '중' : '하'}</span>
                        </div>
                        <div className="info-item">
                            <label>브랜치</label>
                            <div className="branch-badge">{localTask.branch || '-'}</div>
                        </div>
                        <div className="info-item">
                            <label>내용</label>
                            <p className="desc-text">{localTask.content}</p>
                        </div>
                    </div>
                </div>

                <div className="detail-panel center-panel">
                    <div className="section-block">
                        <h4>체크리스트 <button className="text-btn" onClick={() => setIsAddingCheck(true)}>+ 추가</button></h4>
                        {isAddingCheck && (
                            <div className="checklist-input-row">
                                <input value={newCheckItem} onChange={e=>setNewCheckItem(e.target.value)} placeholder="할 일 입력" onKeyPress={e => e.key==='Enter' && handleAddCheckItem()} />
                                <button onClick={handleAddCheckItem}>확인</button>
                            </div>
                        )}
                        <div className="checklist-container">
                            {checklist.map(item => (
                                <div key={item.checkListId} className={`check-row ${item.status ? 'completed' : ''}`}>
                                    <label>
                                        <input type="checkbox" checked={item.status} onChange={() => toggleCheckItem(item)} />
                                        {item.content}
                                    </label>
                                    <button onClick={() => handleDeleteCheckItem(item.checkListId)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-block">
                        <h4>업무 채팅</h4>
                        <div className="comment-list">
                            {chats.map((chat, i) => (
                                <div key={i} className="comment-item">
                                    <div className="comment-meta">{chat.user_id} <span className="time">{chat.date ? new Date(chat.date).toLocaleString() : ''}</span></div>
                                    <div className="comment-text">{chat.content}</div>
                                </div>
                            ))}
                        </div>
                        <div className="comment-input-area">
                            <textarea value={newChat} onChange={e=>setNewChat(e.target.value)} placeholder="내용을 입력하세요" />
                            <button className="btn-send" onClick={handleAddChat}>등록</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;