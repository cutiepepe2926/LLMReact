import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../../utils/api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './TaskDetailPage.css';

const formatTimeAgo = (dateString) => {
    if (!dateString) return '방금 전';
    
    // DB의 UTC 시간에 'Z'를 붙여 브라우저가 로컬 시간으로 계산하도록 함
    const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z';
    const date = new Date(utcDateString);
    
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

    // [웹소켓 연결 및 구독 로직 개선]
    useEffect(() => {
        const socket = new SockJS('/ws-stomp');
        stompClient.current = Stomp.over(socket);
        
        stompClient.current.connect({}, () => {
            // 태스크 ID 기반 구독
            stompClient.current.subscribe(`/sub/tasks/${task.taskId}`, (frame) => {
                const message = JSON.parse(frame.body);

                // message 구조: { type: "...", data: ... }
                switch (message.type) {
                    case 'CHAT':
                        const newChat = message.data;
                        const formattedChat = { 
                            ...newChat, 
                            user_id: newChat.userId, 
                            date: new Date().toISOString() // 받은 시점 시간 사용
                        };
                        setChats(prev => [...prev, formattedChat]);
                        break;

                    case 'CHECKLIST':
                        // 체크리스트 전체 목록 교체
                        setChecklist(message.data || []);
                        break;

                    case 'LOG':
                        // 로그 전체 목록 교체 (순서 보장 등을 위해 전체 갱신이 안전)
                        setLogs(message.data || []);
                        break;

                    case 'STATUS':
                        // 상태값만 갱신
                        const newStatus = message.data;
                        setLocalTask(prev => ({ ...prev, status: newStatus }));
                        // 상위 컴포넌트(보드)에도 알림 (선택 사항)
                        if (onStatusChange) onStatusChange(task.taskId, newStatus);
                        break;
                        
                    case 'TASK_UPDATE':
                        // 태스크 정보 전체 갱신 (제목, 내용 등 수정 시)
                        setLocalTask(message.data);
                        break;

                    default:
                        // 기존 레거시 포맷 호환용 (혹시 모를 에러 방지)
                        if (message.userId && message.content) {
                             const legacyChat = { ...message, user_id: message.userId, date: new Date().toISOString() };
                             setChats(prev => [...prev, legacyChat]);
                        }
                        break;
                }
            });
        });

        return () => { if (stompClient.current) stompClient.current.disconnect(); };
    }, [task.taskId, onStatusChange]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [chats]);


    const handleAddCheckItem = async () => {
        if (!newCheckItem.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/checklists`, { content: newCheckItem });
            setNewCheckItem('');
            setIsAddingCheck(false);
        } catch (e) { alert("실패"); }
    };

    const toggleCheckItem = async (item) => {
        try {
            setChecklist(prev => prev.map(c => c.checkListId === item.checkListId ? { ...c, status: !c.status } : c));
            
            await api.patch(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${item.checkListId}`, { is_done: !item.status });
        } catch (e) { 
            console.error(e); 
        }
    };

    const handleDeleteCheckItem = async (id) => {
        if(!window.confirm("삭제하시겠습니까?")) return;
        try {
            setChecklist(prev => prev.filter(c => c.checkListId !== id));
            await api.delete(`/api/projects/${projectId}/tasks/${task.taskId}/checklists/${id}`);
        } catch (e) { alert("실패"); }
    };

    const handleAddChat = async () => {
        if (!newChat.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/chats`, { content: newChat });
            setNewChat('');
        } catch (e) { alert("실패"); }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLocalTask(prev => ({ ...prev, status: newStatus }));
            await api.patch(`/api/projects/${projectId}/tasks/${task.taskId}/status`, { status: newStatus });
            if (onStatusChange) onStatusChange(localTask.taskId, newStatus);
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
                </section>

                <aside className="detail-panel right-panel">
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
                </aside>
            </div>
        </div>
    );
};

export default TaskDetailPage;