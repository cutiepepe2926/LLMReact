import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../../../utils/api';
import './TaskDetailPage.css';

const TaskDetailPage = ({ projectId, task, onBack, onEdit, onDelete, onStatusChange }) => {
    const [checklist, setChecklist] = useState([]);
    const [chats, setChats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newCheckItem, setNewCheckItem] = useState('');
    const [newChat, setNewChat] = useState('');
    const [isAddingCheck, setIsAddingCheck] = useState(false);
    const [localTask, setLocalTask] = useState(task);

    // 데이터 로드 전용 함수
    const fetchData = useCallback(async () => {
        try {
            const detailData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}`);
            setLocalTask(detailData);
            setChecklist(detailData.checkLists || []);
            
            const chatData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/chats`);
            setChats(chatData || []);
            
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) {
            console.error("데이터 로딩 실패", e);
        }
    }, [projectId, task.taskId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddCheckItem = async () => {
        if (!newCheckItem.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/checklists`, { content: newCheckItem });
            setNewCheckItem('');
            setIsAddingCheck(false);
            fetchData(); // 전체 갱신하여 로그까지 실시간 반영
        } catch (e) { alert("추가 실패"); }
    };

    const toggleCheckItem = async (item) => {
        try {
            await api.patch(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${item.checkListId}`, { is_done: !item.status });
            setChecklist(prev => prev.map(c => c.checkListId === item.checkListId ? { ...c, status: !c.status } : c));
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { console.error(e); }
    };

    const handleDeleteCheckItem = async (id) => {
        if(!window.confirm("삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${id}`);
            setChecklist(prev => prev.filter(c => c.checkListId !== id));
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { alert("삭제 실패"); }
    };

    const handleAddChat = async () => {
        if (!newChat.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/chats`, { content: newChat });
            setNewChat('');
            const chatData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/chats`);
            setChats(chatData || []);
        } catch (e) { alert("전송 실패"); }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await onStatusChange(localTask.taskId, newStatus);
            setLocalTask(prev => ({ ...prev, status: newStatus }));

            window.dispatchEvent(new CustomEvent('taskUpdate'));

            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { console.error(e); }
    };

    return (
        <div className="task-detail-page">
            <header className="detail-header">
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
                    <select className="status-select" value={localTask.status} onChange={(e) => handleStatusUpdate(e.target.value)}>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </header>

            <div className="detail-body">
                {/* 1. 왼쪽 패널: 기본 정보 */}
                <aside className="detail-panel left-panel">
                    <div className="info-card">
                        <h3 className="panel-title">기본 정보</h3>
                        <div className="info-scroll-container">
                            <div className="info-item">
                                <label>담당자</label>
                                <div className="user-badge-list">
                                    {localTask.assigneeIds?.map((uid, i) => <span key={i} className="user-badge">{uid}</span>)}
                                </div>
                            </div>
                            <div className="info-item"><label>마감일</label><div className="date-text">{localTask.dueDate || '미설정'}</div></div>
                            <div className="info-item">
                                <label>우선순위</label>
                                <span className={`priority-badge ${localTask.priority === 3 ? 'high' : localTask.priority === 2 ? 'medium' : 'low'}`}>
                                    {localTask.priority === 3 ? '상' : localTask.priority === 2 ? '중' : '하'}
                                </span>
                            </div>
                            <div className="info-item"><label>브랜치</label><div className="branch-badge">{localTask.branch || '-'}</div></div>
                            <div className="info-item"><label>내용</label><p className="desc-text">{localTask.content}</p></div>
                        </div>
                    </div>
                </aside>

                {/* 2. 중앙 패널: 체크리스트 & 채팅 */}
                <section className="detail-panel center-panel">
                    <div className="section-block checklist-section">
                        <div className="section-header">
                            <h4>체크리스트</h4>
                            <button className="text-btn" onClick={() => setIsAddingCheck(!isAddingCheck)}>
                                {isAddingCheck ? '취소' : '+ 추가'}
                            </button>
                        </div>
                        {isAddingCheck && (
                            <div className="checklist-input-row">
                                <input value={newCheckItem} onChange={e=>setNewCheckItem(e.target.value)} placeholder="할 일 입력..." onKeyPress={e => e.key==='Enter' && handleAddCheckItem()} autoFocus />
                                <button onClick={handleAddCheckItem}>확인</button>
                            </div>
                        )}
                        <div className="checklist-scroll-container">
                            {checklist.map(item => (
                                <div key={item.checkListId} className={`check-row ${item.status ? 'completed' : ''}`}>
                                    <label className="check-label">
                                        <input type="checkbox" checked={item.status} onChange={() => toggleCheckItem(item)} />
                                        <span>{item.content}</span>
                                    </label>
                                    <button className="btn-delete-check" onClick={() => handleDeleteCheckItem(item.checkListId)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-block chat-section">
                        <h4>업무 채팅</h4>
                        <div className="comment-list">
                            {chats.map((chat, i) => (
                                <div key={i} className="comment-item">
                                    <div className="comment-avatar">{chat.user_id?.charAt(0).toUpperCase()}</div>
                                    <div className="comment-bubble">
                                        <div className="comment-meta">
                                            <span className="user-name">{chat.user_id}</span>
                                            <span className="time">{chat.date ? new Date(chat.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                                        </div>
                                        <div className="comment-text">{chat.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="comment-input-area">
                            <textarea value={newChat} onChange={e=>setNewChat(e.target.value)} placeholder="메시지를 입력하세요..." onKeyPress={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault() || handleAddChat())} />
                            <button className="btn-send" onClick={handleAddChat}>전송</button>
                        </div>
                    </div>
                </section>

                {/* 3. 오른쪽 패널: 활동 로그 */}
                <aside className="detail-panel right-panel">
                    <div className="log-card">
                        <h3 className="panel-title">활동 로그</h3>
                        <div className="log-scroll-container">
                            <div className="timeline">
                                {logs.map((log, i) => (
                                    <div key={i} className="timeline-item">
                                        <div className="dot"></div>
                                        <div className="content">
                                            <div className="log-header">
                                                <strong>{log.userId}</strong>
                                                <span className="time">{log.createAt ? new Date(log.createAt).toLocaleString('ko-KR', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '방금 전'}</span>
                                            </div>
                                            <p className="log-desc">{log.content?.replace("항목을 ", "").replace(" 함", "")}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TaskDetailPage;