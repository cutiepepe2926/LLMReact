import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../../utils/api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './TaskDetailPage.css';

const formatTimeAgo = (dateString) => {
    if (!dateString) return '방금 전';
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString();
};

const TaskDetailPage = ({ projectId, task, myRole, onBack, onEdit, onDelete, onStatusChange }) => {
    const [checklist, setChecklist] = useState([]);
    const [chats, setChats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newCheckItem, setNewCheckItem] = useState('');
    const [newChat, setNewChat] = useState('');
    const [isAddingCheck, setIsAddingCheck] = useState(false);
    const [localTask, setLocalTask] = useState(task);
    
    const currentUserId = localStorage.getItem('userId');
    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    const isAdminOrOwner = myRole === 'OWNER' || myRole === 'ADMIN';
    const isAssignee = localTask.assigneeIds?.includes(currentUserId);

    const canEdit = isAdminOrOwner;
    const canWork = isAdminOrOwner || isAssignee;

    const fetchData = useCallback(async () => {
        try {
            const detailData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}`);
            setLocalTask(detailData);
            setChecklist(detailData.checkLists || []);
            const chatData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/chats`);
            setChats(chatData || []);
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { console.error(e); }
    }, [projectId, task.taskId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // 웹소켓 연결
    useEffect(() => {
        const socket = new SockJS('/ws-stomp');
        stompClient.current = Stomp.over(socket);
        stompClient.current.connect({}, () => {
            stompClient.current.subscribe(`/sub/tasks/${task.taskId}`, (frame) => {
                const newChatMessage = JSON.parse(frame.body);
                const formattedChat = { ...newChatMessage, user_id: newChatMessage.userId, date: new Date().toISOString() };
                setChats(prev => [...prev, formattedChat]);
            });
        });
        return () => { if (stompClient.current) stompClient.current.disconnect(); };
    }, [task.taskId]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chats]);

    // 체크리스트 추가
    const handleAddCheckItem = async () => {
        if (!newCheckItem.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/checklists`, { content: newCheckItem });
            setNewCheckItem('');
            setIsAddingCheck(false);
            fetchData(); 
        } catch (e) { alert("실패"); }
    };

    // 체크리스트 토글
    const toggleCheckItem = async (item) => {
        try {
            await api.patch(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${item.checkListId}`, { is_done: !item.status });
            setChecklist(prev => prev.map(c => c.checkListId === item.checkListId ? { ...c, status: !c.status } : c));
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { console.error(e); }
    };

    // 체크리스트 삭제
    const handleDeleteCheckItem = async (id) => {
        if(!window.confirm("삭제하시겠습니까?")) return;
        try {
            await api.delete(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${id}`);
            setChecklist(prev => prev.filter(c => c.checkListId !== id));
            const logData = await api.get(`/api/projects/${projectId}/tasks/${task.taskId}/logs`);
            setLogs(logData || []);
        } catch (e) { alert("실패"); }
    };

    // 채팅 전송
    const handleAddChat = async () => {
        if (!newChat.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/chats`, { content: newChat });
            setNewChat('');
        } catch (e) { alert("실패"); }
    };

    // 상태 변경
    const handleStatusUpdate = async (newStatus) => {
        try {
            await onStatusChange(localTask.taskId, newStatus);
            setLocalTask(prev => ({ ...prev, status: newStatus }));
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
                    {canEdit && (
                        <div className="action-buttons">
                            <button className="btn-action edit" onClick={onEdit}>수정</button>
                            <button className="btn-action delete" onClick={onDelete}>삭제</button>
                        </div>
                    )}
                    
                    {canWork ? (
                        <select className="status-select" value={localTask.status} onChange={(e) => handleStatusUpdate(e.target.value)}>
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                    ) : (
                        <span className="status-badge-readonly">{localTask.status}</span>
                    )}
                </div>
            </header>

            <div className="detail-body">
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
                            <div className="info-item"><label>브랜치</label><div className="branch-badge">{localTask.branch || '-'}</div></div>
                            <div className="info-item"><label>내용</label><p className="desc-text">{localTask.content}</p></div>
                        </div>
                    </div>
                </aside>

                <section className="detail-panel center-panel">
                    <div className="section-block checklist-section">
                        <div className="section-header">
                            <h4>체크리스트</h4>
                            {canWork && (
                                <button className="text-btn" onClick={() => setIsAddingCheck(!isAddingCheck)}>
                                    {isAddingCheck ? '취소' : '+ 추가'}
                                </button>
                            )}
                        </div>
                        {isAddingCheck && (
                            <div className="checklist-input-row">
                                <input value={newCheckItem} onChange={e=>setNewCheckItem(e.target.value)} onKeyPress={e => e.key==='Enter' && handleAddCheckItem()} />
                                <button onClick={handleAddCheckItem}>확인</button>
                            </div>
                        )}
                        <div className="checklist-scroll-container">
                            {checklist.map(item => (
                                <div key={item.checkListId} className={`check-row ${item.status ? 'completed' : ''}`}>
                                    <label className="check-label">
                                        <input type="checkbox" checked={item.status} onChange={() => toggleCheckItem(item)} disabled={!canWork} />
                                        <span>{item.content}</span>
                                    </label>
                                    {canWork && (
                                        <button className="btn-delete-check" onClick={() => handleDeleteCheckItem(item.checkListId)}>×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section-block chat-section">
                        <h4>업무 채팅</h4>
                        <div className="comment-list">
                            {chats.map((chat, i) => (
                                <div key={i} className={`comment-wrapper ${String(chat.user_id).trim() === currentUserId ? 'me' : 'other'}`}>
                                    {String(chat.user_id).trim() !== currentUserId && <div className="comment-avatar">{String(chat.user_id).charAt(0).toUpperCase()}</div>}
                                    <div className="comment-content-group">
                                        <div className="comment-bubble">{chat.content}</div>
                                        <span className="time">{chat.date ? formatTimeAgo(chat.date) : '방금'}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="comment-input-area">
                            <textarea value={newChat} onChange={e=>setNewChat(e.target.value)} onKeyPress={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault() || handleAddChat())} placeholder="메시지 입력..." />
                            <button className="btn-send" onClick={handleAddChat}>전송</button>
                        </div>
                    </div>
                </section>

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
                                                <span className="time">{log.createAt ? formatTimeAgo(log.createAt) : '방금 전'}</span>
                                            </div>
                                            <p className="log-desc">{log.content}</p>
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