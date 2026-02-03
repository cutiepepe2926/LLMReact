import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../../../utils/api';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import './TaskDetailPage.css';

const TaskDetailPage = ({ projectId, task, onBack, onEdit, onDelete, onStatusChange }) => {
    const [checklist, setChecklist] = useState([]);
    const [chats, setChats] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newCheckItem, setNewCheckItem] = useState('');
    const [newChat, setNewChat] = useState('');
    const [isAddingCheck, setIsAddingCheck] = useState(false);
    const [localTask, setLocalTask] = useState(task);
    
    //현재 로그인한 유저 ID 가져오기
    const currentUserId = localStorage.getItem('userId');

    // 소켓 클라이언트 객체 관리
    const stompClient = useRef(null);

    // 스크롤 포커스용
    const messagesEndRef = useRef(null);

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

    // 실시간 채팅 연결 (WebSocket)
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/ws-stomp'); 
        stompClient.current = Stomp.over(socket);
        stompClient.current.debug = () => {};

        stompClient.current.connect({}, () => {
            // 2. 구독: /sub/tasks/{taskId}
            stompClient.current.subscribe(`/sub/tasks/${task.taskId}`, (frame) => {
                const newChatMessage = JSON.parse(frame.body);
                
                const formattedChat = {
                    ...newChatMessage,
                    user_id: newChatMessage.userId || newChatMessage.user_id, // 호환성 처리
                    date: new Date().toISOString() // 받은 시간 현재 시간으로 처리
                };

                // 3. 채팅 목록에 실시간 추가
                setChats(prev => [...prev, formattedChat]);
            });
        });

        // 4. 언마운트 시 연결 해제
        return () => {
            if (stompClient.current) stompClient.current.disconnect();
        };
    }, [task.taskId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    const handleAddCheckItem = async () => {
        if (!newCheckItem.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/checklists`, { content: newCheckItem });
            setNewCheckItem('');
            setIsAddingCheck(false);
            fetchData(); 
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

    // 채팅 전송 함수
    const handleAddChat = async () => {
        if (!newChat.trim()) return;
        try {
            await api.post(`/api/projects/${projectId}/tasks/${task.taskId}/chats`, { content: newChat });
            setNewChat('');
            
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
                            {chats.map((chat, i) => {
                                // [수정] ID 비교 시 공백 제거 및 문자열 변환으로 정확도 향상
                                const chatUserId = String(chat.user_id || chat.userId || '').trim();
                                const isMe = chatUserId === currentUserId;

                                return (
                                    <div key={i} className={`comment-wrapper ${isMe ? 'me' : 'other'}`}>
                                        {/* 상대방일 때만 프사 표시 */}
                                        {!isMe && (
                                            <div className="comment-avatar">
                                                {chatUserId.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        
                                        <div className="comment-content-group">
                                            {/* 상대방일 때만 이름 표시 */}
                                            {!isMe && <span className="user-name">{chatUserId}</span>}
                                            
                                            <div className="bubble-row">
                                                {/* 내가 보낸 건 시간 먼저, 상대방은 말풍선 먼저 */}
                                                {isMe && <span className="time">{chat.date ? new Date(chat.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '방금'}</span>}
                                                
                                                <div className="comment-bubble">
                                                    {chat.content}
                                                </div>
                                                
                                                {!isMe && <span className="time">{chat.date ? new Date(chat.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '방금'}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <div className="comment-input-area">
                            <textarea 
                                value={newChat} 
                                onChange={e=>setNewChat(e.target.value)} 
                                placeholder="메시지 입력..." 
                                onKeyPress={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault() || handleAddChat())} 
                            />
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