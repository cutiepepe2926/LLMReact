import React, { useState } from 'react';
import './TaskDetailPage.css';

const TaskDetailPage = ({ task, onBack, onEdit, onDelete, onStatusChange }) => {

    // [API 일치] checklist 데이터 구조: { id, content, is_done }
    const [checklist, setChecklist] = useState(task.checklist || []);
    const [isAddingCheck, setIsAddingCheck] = useState(false);
    const [newCheckItem, setNewCheckItem] = useState('');

    // [API 일치] comments -> chats 로 변경, 필드명 { content, created_at, user }
    const [chats, setChats] = useState(task.chats || []);
    const [newChat, setNewChat] = useState('');

    if (!task) return null;

    // --- [핸들러] ---
    
    // 1. 체크리스트 추가
    const handleAddCheckItem = () => {
        if (newCheckItem.trim()) {
            const newItem = { 
                id: Date.now(), 
                content: newCheckItem, // API 필드명 content
                is_done: false         // API 필드명 is_done
            };
            setChecklist([...checklist, newItem]);
            setNewCheckItem('');
            setIsAddingCheck(false);
        }
    };

    // 2. 체크박스 토글 (완료/미완료)
    const toggleCheckItem = (id) => {
        setChecklist(checklist.map(item => 
            item.id === id ? { ...item, is_done: !item.is_done } : item
        ));
    };

    // 3. [New] 체크리스트 삭제
    const handleDeleteCheckItem = (id) => {
        if(window.confirm("이 항목을 삭제하시겠습니까?")) {
            // API 호출: DELETE /api/.../checklists/{id}
            setChecklist(checklist.filter(item => item.id !== id));
        }
    };

    // 4. 채팅 등록 (Comment -> Chat)
    const handleAddChat = () => {
        if (newChat.trim()) {
            const chat = {
                id: Date.now(),
                user: '홍길동', 
                content: newChat,      // API 필드명 content
                created_at: '방금 전'  // API 필드명 created_at
            };
            setChats([...chats, chat]);
            setNewChat('');
        }
    };

    // 상태 배지 스타일
    const getStatusStyle = (status) => {
        switch(status) {
            case 'TODO': return { color: '#3b82f6', borderColor: '#3b82f6', background: '#eff6ff' };
            case 'IN_PROGRESS': return { color: '#f59e0b', borderColor: '#f59e0b', background: '#fffbeb' };
            case 'DONE': return { color: '#10b981', borderColor: '#10b981', background: '#ecfdf5' };
            default: return {};
        }
    };

    return (
        <div className="task-detail-page">
            {/* 헤더 */}
            <div className="detail-header">
                <div className="header-left">
                    <button className="back-btn" onClick={onBack}>← 뒤로가기</button>
                    <span className="divider"></span>
                    <span className="task-key">TASK-{task.id}</span>
                    <h2 className="task-title">{task.title}</h2>
                </div>
                
                <div className="header-right">
                    <div className="action-buttons">
                        <button className="btn-action edit" onClick={onEdit}>수정</button>
                        <button className="btn-action delete" onClick={onDelete}>삭제</button>
                    </div>
                    <div className="vertical-divider"></div>
                    <select 
                        className="status-select" 
                        value={task.status}
                        onChange={(e) => onStatusChange(task.id, e.target.value)} // ID 전달로 변경
                        style={getStatusStyle(task.status)}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </div>

            <div className="detail-body">
                {/* [왼쪽] 기본 정보 */}
                <div className="detail-panel left-panel">
                    <div className="info-card">
                        <h3 className="panel-title">기본 정보</h3>
                        <div className="info-item">
                            <label>담당자</label>
                            <div className="user-badge-list">
                                {task.assignees && task.assignees.length > 0 ? (
                                    task.assignees.map((user, idx) => (
                                        <div key={idx} className="user-badge">
                                            <span className="avatar">{user.charAt(0)}</span>
                                            {user}
                                        </div>
                                    ))
                                ) : <span style={{color: '#999', fontSize: '0.9rem'}}>(미지정)</span>}
                            </div>
                        </div>
                        <div className="info-item">
                            <label>기간</label>
                            <div className="date-text">{task.dDay} ({task.startDate || '미설정'} ~ {task.endDate || '미설정'})</div>
                        </div>
                        <div className="info-item">
                            <label>우선순위</label>
                            <span className={`priority-badge ${task.priority === '상' ? 'high' : task.priority === '중' ? 'medium' : 'low'}`}>
                                {task.priority}
                            </span>
                        </div>
                        <div className="info-item">
                            <label>관련 브랜치</label>
                            <div className="branch-badge">{task.branch || '미연동'}</div>
                        </div>
                        <div className="info-item">
                            <label>업무 설명</label>
                            <div className="desc-text">{task.description || "설명이 없습니다."}</div>
                        </div>
                    </div>
                </div>

                {/* [중앙] 체크리스트 & 채팅 */}
                <div className="detail-panel center-panel">
                    
                    {/* 체크리스트 섹션 */}
                    <div className="section-block">
                        <div className="section-header">
                            <h4>체크리스트</h4>
                            <button className="text-btn" onClick={() => setIsAddingCheck(true)}>+ 추가</button>
                        </div>
                        
                        <div className="checklist-container">
                            {isAddingCheck && (
                                <div className="checklist-input-row">
                                    <input 
                                        type="text" 
                                        placeholder="할 일을 입력하세요" 
                                        value={newCheckItem}
                                        onChange={(e) => setNewCheckItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCheckItem()}
                                        autoFocus
                                    />
                                    <button onClick={handleAddCheckItem}>확인</button>
                                    <button className="cancel" onClick={() => setIsAddingCheck(false)}>취소</button>
                                </div>
                            )}

                            {checklist.length > 0 ? (
                                checklist.map(item => (
                                    <div key={item.id} className={`check-row ${item.is_done ? 'completed' : ''}`}>
                                        <label className="check-label">
                                            <input 
                                                type="checkbox" 
                                                checked={item.is_done} 
                                                onChange={() => toggleCheckItem(item.id)} 
                                            /> 
                                            <span>{item.content}</span>
                                        </label>
                                        <button 
                                            className="btn-delete-check" 
                                            onClick={() => handleDeleteCheckItem(item.id)}
                                            title="삭제"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            ) : (
                                !isAddingCheck && <div className="empty-state">등록된 체크리스트가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 업무 채팅 섹션 */}
                    <div className="section-block">
                        <div className="section-header"><h4>업무 채팅</h4></div>
                        
                        <div className="comment-list">
                            {chats.length > 0 ? (
                                chats.map(chat => (
                                    <div key={chat.id} className="comment-item">
                                        <div className="comment-avatar">{chat.user.charAt(0)}</div>
                                        <div className="comment-bubble">
                                            <div className="comment-meta">
                                                <span className="user-name">{chat.user}</span>
                                                <span className="time">{chat.created_at}</span>
                                            </div>
                                            <div className="comment-text">{chat.content}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">작성된 채팅이 없습니다.</div>
                            )}
                        </div>

                        <div className="comment-input-area">
                            <textarea 
                                value={newChat}
                                onChange={(e) => setNewChat(e.target.value)}
                                onKeyPress={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddChat();
                                    }
                                }}
                            />
                            <button className="btn-send" onClick={handleAddChat}>등록</button>
                        </div>
                    </div>
                </div>

                {/* [오른쪽] 활동 로그 */}
                <div className="detail-panel right-panel">
                    <div className="log-card">
                        <h3 className="panel-title">활동 로그</h3>
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="dot"></div>
                                <div className="content">
                                    <strong>시스템</strong>: 업무가 조회되었습니다.
                                    <span className="time">방금 전</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;