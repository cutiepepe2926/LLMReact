import React, { useState } from 'react';
import './TaskDetailPage.css';

const TaskDetailPage = ({ task, onBack, onEdit, onDelete, onStatusChange }) => {

    const [checklist, setChecklist] = useState(task.checklist || []);
    const [isAddingCheck, setIsAddingCheck] = useState(false); // 체크리스트 입력창 토글
    const [newCheckItem, setNewCheckItem] = useState('');

    const [comments, setComments] = useState(task.comments || []);
    const [newComment, setNewComment] = useState('');

    if (!task) return null;

    // --- [핸들러] ---
    
    // 체크리스트 추가
    const handleAddCheckItem = () => {
        if (newCheckItem.trim()) {
            setChecklist([...checklist, { id: Date.now(), text: newCheckItem, checked: false }]);
            setNewCheckItem('');
            setIsAddingCheck(false); // 입력 후 닫기
        }
    };

    // 체크박스 토글
    const toggleCheckItem = (id) => {
        setChecklist(checklist.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    // 댓글 등록
    const handleAddComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now(),
                user: '홍길동', // 현재 로그인 유저
                text: newComment,
                time: '방금 전'
            };
            setComments([...comments, comment]); // 목록에 추가
            setNewComment('');
        }
    };

    // 상태 색상
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
                        onChange={(e) => onStatusChange(task, e.target.value)}
                        style={getStatusStyle(task.status)}
                    >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </div>

            {/* 본문 */}
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
                            <div className="date-text">{task.startDate ? `${task.startDate} ~ ${task.endDate}` : '기간 미설정'}</div>
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

                {/* [중앙] 작업 영역 */}
                <div className="detail-panel center-panel">
                    
                    {/* 1. 체크리스트 섹션 */}
                    <div className="section-block">
                        <div className="section-header">
                            <h4>체크리스트</h4>
                            {/* + 버튼 누르면 입력창 열림 */}
                            <button className="text-btn" onClick={() => setIsAddingCheck(true)}>+ 추가</button>
                        </div>
                        
                        <div className="checklist-container">
                            {/* 입력 모드일 때 나타나는 인풋 */}
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
                                    <label key={item.id} className={`check-item ${item.checked ? 'completed' : ''}`}>
                                        <input 
                                            type="checkbox" 
                                            checked={item.checked} 
                                            onChange={() => toggleCheckItem(item.id)} 
                                        /> 
                                        <span>{item.text}</span>
                                    </label>
                                ))
                            ) : (
                                !isAddingCheck && <div className="empty-state">등록된 체크리스트가 없습니다.</div>
                            )}
                        </div>
                    </div>

                    {/* 2. 댓글 섹션 */}
                    <div className="section-block">
                        <div className="section-header"><h4>댓글</h4></div>
                        
                        {/* 댓글 리스트 */}
                        <div className="comment-list">
                            {comments.length > 0 ? (
                                comments.map(comment => (
                                    <div key={comment.id} className="comment-item">
                                        <div className="comment-avatar">{comment.user.charAt(0)}</div>
                                        <div className="comment-bubble">
                                            <div className="comment-meta">
                                                <span className="user-name">{comment.user}</span>
                                                <span className="time">{comment.time}</span>
                                            </div>
                                            <div className="comment-text">{comment.text}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">아직 작성된 댓글이 없습니다.</div>
                            )}
                        </div>

                        {/* 🔥 [추가] 댓글 입력창 */}
                        <div className="comment-input-area">
                            <textarea 
                                placeholder="댓글을 입력하세요..." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyPress={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddComment();
                                    }
                                }}
                            />
                            <button className="btn-send" onClick={handleAddComment}>등록</button>
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